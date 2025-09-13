import mongoose from 'mongoose';
declare const User: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    isActive: boolean;
    username: string;
    password: string;
    role: "user";
    isAccountHolder: boolean;
    sharedAccounts: mongoose.Types.DocumentArray<{
        accountId: mongoose.Types.ObjectId;
        accountName: string;
        permissions: string[];
        sharedAt: NativeDate;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        accountId: mongoose.Types.ObjectId;
        accountName: string;
        permissions: string[];
        sharedAt: NativeDate;
    }> & {
        accountId: mongoose.Types.ObjectId;
        accountName: string;
        permissions: string[];
        sharedAt: NativeDate;
    }>;
    cannotBeCancelled: boolean;
    lastActivity: NativeDate;
    lastLogin: NativeDate;
    loginHistory: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        ipAddress?: string | null | undefined;
        userAgent?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        timestamp: NativeDate;
        ipAddress?: string | null | undefined;
        userAgent?: string | null | undefined;
    }> & {
        timestamp: NativeDate;
        ipAddress?: string | null | undefined;
        userAgent?: string | null | undefined;
    }>;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    isActive: boolean;
    username: string;
    password: string;
    role: "user";
    isAccountHolder: boolean;
    sharedAccounts: mongoose.Types.DocumentArray<{
        accountId: mongoose.Types.ObjectId;
        accountName: string;
        permissions: string[];
        sharedAt: NativeDate;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        accountId: mongoose.Types.ObjectId;
        accountName: string;
        permissions: string[];
        sharedAt: NativeDate;
    }> & {
        accountId: mongoose.Types.ObjectId;
        accountName: string;
        permissions: string[];
        sharedAt: NativeDate;
    }>;
    cannotBeCancelled: boolean;
    lastActivity: NativeDate;
    lastLogin: NativeDate;
    loginHistory: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        ipAddress?: string | null | undefined;
        userAgent?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        timestamp: NativeDate;
        ipAddress?: string | null | undefined;
        userAgent?: string | null | undefined;
    }> & {
        timestamp: NativeDate;
        ipAddress?: string | null | undefined;
        userAgent?: string | null | undefined;
    }>;
}, {}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    isActive: boolean;
    username: string;
    password: string;
    role: "user";
    isAccountHolder: boolean;
    sharedAccounts: mongoose.Types.DocumentArray<{
        accountId: mongoose.Types.ObjectId;
        accountName: string;
        permissions: string[];
        sharedAt: NativeDate;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        accountId: mongoose.Types.ObjectId;
        accountName: string;
        permissions: string[];
        sharedAt: NativeDate;
    }> & {
        accountId: mongoose.Types.ObjectId;
        accountName: string;
        permissions: string[];
        sharedAt: NativeDate;
    }>;
    cannotBeCancelled: boolean;
    lastActivity: NativeDate;
    lastLogin: NativeDate;
    loginHistory: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        ipAddress?: string | null | undefined;
        userAgent?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        timestamp: NativeDate;
        ipAddress?: string | null | undefined;
        userAgent?: string | null | undefined;
    }> & {
        timestamp: NativeDate;
        ipAddress?: string | null | undefined;
        userAgent?: string | null | undefined;
    }>;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    isActive: boolean;
    username: string;
    password: string;
    role: "user";
    isAccountHolder: boolean;
    sharedAccounts: mongoose.Types.DocumentArray<{
        accountId: mongoose.Types.ObjectId;
        accountName: string;
        permissions: string[];
        sharedAt: NativeDate;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        accountId: mongoose.Types.ObjectId;
        accountName: string;
        permissions: string[];
        sharedAt: NativeDate;
    }> & {
        accountId: mongoose.Types.ObjectId;
        accountName: string;
        permissions: string[];
        sharedAt: NativeDate;
    }>;
    cannotBeCancelled: boolean;
    lastActivity: NativeDate;
    lastLogin: NativeDate;
    loginHistory: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        ipAddress?: string | null | undefined;
        userAgent?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        timestamp: NativeDate;
        ipAddress?: string | null | undefined;
        userAgent?: string | null | undefined;
    }> & {
        timestamp: NativeDate;
        ipAddress?: string | null | undefined;
        userAgent?: string | null | undefined;
    }>;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    isActive: boolean;
    username: string;
    password: string;
    role: "user";
    isAccountHolder: boolean;
    sharedAccounts: mongoose.Types.DocumentArray<{
        accountId: mongoose.Types.ObjectId;
        accountName: string;
        permissions: string[];
        sharedAt: NativeDate;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        accountId: mongoose.Types.ObjectId;
        accountName: string;
        permissions: string[];
        sharedAt: NativeDate;
    }> & {
        accountId: mongoose.Types.ObjectId;
        accountName: string;
        permissions: string[];
        sharedAt: NativeDate;
    }>;
    cannotBeCancelled: boolean;
    lastActivity: NativeDate;
    lastLogin: NativeDate;
    loginHistory: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        ipAddress?: string | null | undefined;
        userAgent?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        timestamp: NativeDate;
        ipAddress?: string | null | undefined;
        userAgent?: string | null | undefined;
    }> & {
        timestamp: NativeDate;
        ipAddress?: string | null | undefined;
        userAgent?: string | null | undefined;
    }>;
}>, {}> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    isActive: boolean;
    username: string;
    password: string;
    role: "user";
    isAccountHolder: boolean;
    sharedAccounts: mongoose.Types.DocumentArray<{
        accountId: mongoose.Types.ObjectId;
        accountName: string;
        permissions: string[];
        sharedAt: NativeDate;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        accountId: mongoose.Types.ObjectId;
        accountName: string;
        permissions: string[];
        sharedAt: NativeDate;
    }> & {
        accountId: mongoose.Types.ObjectId;
        accountName: string;
        permissions: string[];
        sharedAt: NativeDate;
    }>;
    cannotBeCancelled: boolean;
    lastActivity: NativeDate;
    lastLogin: NativeDate;
    loginHistory: mongoose.Types.DocumentArray<{
        timestamp: NativeDate;
        ipAddress?: string | null | undefined;
        userAgent?: string | null | undefined;
    }, mongoose.Types.Subdocument<mongoose.Types.ObjectId, any, {
        timestamp: NativeDate;
        ipAddress?: string | null | undefined;
        userAgent?: string | null | undefined;
    }> & {
        timestamp: NativeDate;
        ipAddress?: string | null | undefined;
        userAgent?: string | null | undefined;
    }>;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default User;
//# sourceMappingURL=User.d.ts.map