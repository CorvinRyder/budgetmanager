import Image from "next/image";
import styles from "./page.module.css";
import "../types";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}></main>
    </div>
  );
}
