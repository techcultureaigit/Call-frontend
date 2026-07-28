import { downloadCSV } from "@/lib/utils/csv";

/** Sample CSV for Survey Questions upload (columns match parseCSV importer) */
export const SURVEY_QUESTIONS_SAMPLE_CSV = [
  "question,type,options",
  '"How satisfied are you with our service?",text,',
  '"Would you recommend us to a friend?",yes_no,',
  '"Rate your overall experience from 1 to 5",rating,',
  '"Which feature do you use most?",multi,"Dashboard | Reports | Calls | Support"',
  '"Any additional feedback for us?",text,',
].join("\n");

/** Sample CSV for Contact of Client upload */
export const CLIENT_CONTACTS_SAMPLE_CSV = [
  "name,phone,email,company",
  "Rahul Sharma,9876543210,rahul.sharma@example.com,Acme Corp",
  "Priya Patel,9123456780,priya.patel@example.com,TechCulture AI",
  "Amit Verma,9988776655,amit.verma@example.com,Bright Retail",
  "Sneha Kapoor,9012345678,sneha.kapoor@example.com,Northwind Foods",
].join("\n");

export function downloadSurveyQuestionsSample() {
  downloadCSV(SURVEY_QUESTIONS_SAMPLE_CSV, "sample-survey-questions.csv");
}

export function downloadClientContactsSample() {
  downloadCSV(CLIENT_CONTACTS_SAMPLE_CSV, "sample-client-contacts.csv");
}
