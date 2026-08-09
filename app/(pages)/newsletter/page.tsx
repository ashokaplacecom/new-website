import fs from "fs/promises";
import path from "path";
import { simpleParser } from "mailparser";
import { format, parseISO } from "date-fns";

export default async function NewsletterPage() {
  const newslettersDir = path.join(process.cwd(), "content/newsletters");
  let latestNewsletterData = null;
  let htmlContent = "";

  try {
    // 1. Find the latest newsletter from Keystatic collection
    const folders = await fs.readdir(newslettersDir);
    if (folders.length > 0) {
      // Just taking the first folder for now, assuming they sort alphabetically or there's only one.
      // Better approach: parse all index.json and sort by date
      const entries = await Promise.all(
        folders.map(async (folder) => {
          const jsonPath = path.join(newslettersDir, folder, "index.json");
          const data = await fs.readFile(jsonPath, "utf-8");
          return JSON.parse(data);
        })
      );
      
      // Sort descending by fromDate
      entries.sort((a, b) => new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime());
      latestNewsletterData = entries[0];
    }
  } catch (error) {
    console.error("Error reading keystatic newsletters", error);
  }

  if (!latestNewsletterData || !latestNewsletterData.emlFile) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Newsletter</h1>
        <p className="text-muted-foreground text-lg">No newsletters have been published yet. Check back soon!</p>
      </div>
    );
  }

  // 2. Read the actual .eml file and parse it
  try {
    // Keystatic saves publicPath as something like /newsletters/... 
    // We need to read it from public directory
    const emlFilePath = path.join(process.cwd(), "public", latestNewsletterData.emlFile);
    const emlBuffer = await fs.readFile(emlFilePath);
    
    const parsed = await simpleParser(emlBuffer);
    htmlContent = parsed.html || parsed.textAsHtml || "<p>No content</p>";

    // Replace CID images with base64 data URIs
    if (parsed.attachments && parsed.attachments.length > 0) {
      for (const attachment of parsed.attachments) {
        if (attachment.contentId && attachment.content) {
          const cid = attachment.contentId.replace(/[<>]/g, "");
          const base64Data = attachment.content.toString("base64");
          const dataUri = `data:${attachment.contentType};base64,${base64Data}`;
          const cidRegex = new RegExp(`cid:${cid}`, 'gi');
          htmlContent = htmlContent.replace(cidRegex, dataUri);
        }
      }
    }
  } catch (error) {
    console.error("Error parsing EML file", error);
    htmlContent = "<p>Error loading the newsletter content.</p>";
  }

  // Format dates nicely, e.g. "1st to 7th August"
  const from = parseISO(latestNewsletterData.fromDate);
  const to = parseISO(latestNewsletterData.toDate);
  
  // Custom format logic for "1st to 7th August"
  const formatDay = (date: Date) => format(date, "do");
  const month = format(to, "MMMM"); // use 'to' month
  const titleText = latestNewsletterData.title || `Weekly for ${formatDay(from)} to ${formatDay(to)} ${month}`;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">{titleText}</h1>
        <p className="text-muted-foreground">
          Showing updates from {latestNewsletterData.fromDate} to {latestNewsletterData.toDate}
        </p>
      </div>

      <div 
        className="bg-white border rounded-xl shadow-sm overflow-x-auto"
        style={{ minHeight: "60vh" }}
      >
        <div 
          className="p-4 md:p-8 w-full prose prose-slate max-w-none newsletter-content"
          dangerouslySetInnerHTML={{ __html: htmlContent }} 
        />
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .newsletter-content {
            font-family: inherit;
            color: #333;
            overflow-wrap: break-word;
            word-break: break-word;
          }
          .newsletter-content a {
            color: #0056b3;
            text-decoration: underline;
          }
          .newsletter-content img {
            max-width: 100% !important;
            height: auto !important;
          }
          .newsletter-content table, 
          .newsletter-content div,
          .newsletter-content td {
            max-width: 100% !important;
          }
        `
      }} />
    </div>
  );
}
