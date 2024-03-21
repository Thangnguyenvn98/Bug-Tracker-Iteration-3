export interface BugFormDetail {
    number: number;
    type: string;
    summary: string;
    createdBy: string;
    progressUpdates: string[];
    createdAt: Date;
    closedAt?: Date; 
    isClosed: boolean;
    reasonForClosing?: string; 
    bugFixDetails?: string;
    isFixed: boolean;
}