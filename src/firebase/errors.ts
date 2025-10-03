export type SecurityRuleContext = {
    path: string;
    operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
    requestResourceData?: any;
};
  
  
export class FirestorePermissionError extends Error {
    public context: SecurityRuleContext;

    constructor(context: SecurityRuleContext) {
        const message = `FirestorePermissionError: Insufficient permissions for ${context.operation} at ${context.path}.`;
        super(message);
        this.name = 'FirestorePermissionError';
        this.context = context;

        Object.setPrototypeOf(this, FirestorePermissionError.prototype);
    }
}
