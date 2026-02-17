import { 
    FirestoreDataConverter, 
    QueryDocumentSnapshot, 
    SnapshotOptions,
    DocumentData,
    Timestamp 
} from 'firebase/firestore';
import { Prompt, PromptSchema, UserProfile } from '@/lib/schemas';

export const promptConverter: FirestoreDataConverter<Prompt> = {
    toFirestore(prompt: Prompt): DocumentData {
        // Remove id from the data stored in Firestore
        const { id, ...data } = prompt;
        return data;
    },
    fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
    ): Prompt {
        const data = snapshot.data(options);
        
        const promptData = {
            ...data,
            id: snapshot.id,
            // Convert Firestore Timestamp to serializable object for Zod validation
            createdAt: data.createdAt instanceof Timestamp ? {
                seconds: data.createdAt.seconds,
                nanoseconds: data.createdAt.nanoseconds,
            } : data.createdAt,
        };

        const result = PromptSchema.safeParse(promptData);
        if (!result.success) {
            console.error('Prompt validation failed:', result.error);
            return promptData as Prompt;
        }
        
        return result.data;
    }
};

export const userProfileConverter: FirestoreDataConverter<UserProfile> = {
    toFirestore(profile: UserProfile): DocumentData {
        return profile;
    },
    fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
    ): UserProfile {
        const data = snapshot.data(options);
        return data as UserProfile;
    }
};
