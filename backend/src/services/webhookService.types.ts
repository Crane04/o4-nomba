export interface NombaTransferPayload {
  amount: number;
  senderName: string;
  senderAccountNumber?: string;
  narration?: string;
  reference: string;
  virtualAccountNumber: string;
}
