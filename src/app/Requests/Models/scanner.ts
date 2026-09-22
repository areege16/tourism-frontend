/* -------------------------Scanner------------------------------------------ */

export interface LatestScanFileDto {
  fileName: string;
  relativePath: string;
  lastWriteTime: string;
  size: number;
  url: string;
}

export interface LatestScanBatchDto {
  batchKey: string;
  files: LatestScanFileDto[];
}
