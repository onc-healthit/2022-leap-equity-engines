import { FirebaseOptions } from "@healthlab/firebase";

export type Config = {
  backendGraphQLUrl: string;
  backendUrl: string;
  medlineUrl: string;
  firebaseConfig: FirebaseOptions;
};

export const config: Config = {
  backendGraphQLUrl: process.env.NEXT_PUBLIC_BACKEND_GRAPHQL_URL!,
  firebaseConfig: JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG_STRING!),
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080",
  medlineUrl:
    "https://connect.medlineplus.gov/service?mainSearchCriteria.v.cs=2.16.840.1.113883.6.1&informationRecipient.languageCode.c=en&knowledgeResponseType=application/json&mainSearchCriteria.v.c=",
};
