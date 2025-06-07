import Image from "next/image";
import styles from "./page.module.css";
import "../types";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <div>
          This page is just a temporary simple landing page <br />
          because I don't have time to make it looks good LOL
        </div>
        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="/viewtrans"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            View Transactions
          </a>
          <a
            href="/addtrans"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.secondary}
          >
            Add New Transaction
          </a>
        </div>
      </main>
    </div>
  );
}
