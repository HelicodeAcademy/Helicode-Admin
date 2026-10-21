import axios from "axios";
import { getApiClient } from "./api-client";

export interface CsvExportResult {
  filename: string;
  totalCount: number | null;
  truncated: boolean;
}

function filenameFromDisposition(header: string | undefined, fallback: string) {
  if (!header) return fallback;
  const utfMatch = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1]);
    } catch {
      return utfMatch[1];
    }
  }
  const match = header.match(/filename="?([^"]+)"?/i);
  return match?.[1] || fallback;
}

function cleanParams(params: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
}

export async function downloadCsv(
  path: string,
  params: Record<string, unknown>,
  fallbackFilename: string,
): Promise<CsvExportResult> {
  const api = getApiClient();

  try {
    const response = await api.get(path, {
      params: { ...cleanParams(params), format: "csv" },
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename = filenameFromDisposition(
      response.headers["content-disposition"],
      fallbackFilename,
    );
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    const totalHeader = response.headers["x-total-count"];
    const truncated =
      String(response.headers["x-export-truncated"] || "").toLowerCase() ===
      "true";

    return {
      filename,
      totalCount: totalHeader ? Number(totalHeader) : null,
      truncated,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
      const text = await error.response.data.text();
      try {
        const parsed = JSON.parse(text);
        const message =
          parsed?.message ||
          parsed?.data?.message ||
          "Failed to export CSV";
        const wrapped = new Error(message) as Error & {
          response: { data: { message: string }; status?: number };
        };
        wrapped.response = {
          data: { message },
          status: error.response.status,
        };
        throw wrapped;
      } catch (parsedError) {
        if (parsedError instanceof SyntaxError) {
          throw error;
        }
        throw parsedError;
      }
    }
    throw error;
  }
}
