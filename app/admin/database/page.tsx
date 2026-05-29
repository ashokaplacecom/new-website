import { DatabaseClient } from "./database-client";
import { TABLE_META } from "./schema";

export default function DatabasePage() {
  return <DatabaseClient tables={TABLE_META} />;
}
