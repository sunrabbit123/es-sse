export interface SSEEvent {
  event?: string;
  data?: string;
  id?: string;
  retry?: number;
}

export interface ParseResult {
  restString: string;
  data: Array<SSEEvent>;
}
