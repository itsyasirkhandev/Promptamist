import * as admin from 'firebase-admin';

export async function getAdminDb() {
    if (!admin.apps.length) {
        if (process.env.FIRESTORE_EMULATOR_HOST) {
            admin.initializeApp({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dev-project',
            });
        } else {
            const privateKey = process.env.FIREBASE_PRIVATE_KEY;
            const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
            const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

            if (privateKey && clientEmail) {
                let formattedKey = privateKey;
                if (formattedKey.startsWith("'" ) && formattedKey.endsWith("'" )) {
                    formattedKey = formattedKey.slice(1, -1);
                }
                if (formattedKey.startsWith("'" ) && formattedKey.endsWith("'" )) {
                    formattedKey = formattedKey.slice(1, -1);
                }
                formattedKey = formattedKey.replace(/\\n/g, '\n');

                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId,
                        clientEmail,
                        privateKey: formattedKey,
                    }),
                });
            } else {
                admin.initializeApp({
                    projectId: projectId,
                });
            }
        }
    }
    return admin.firestore();
}
