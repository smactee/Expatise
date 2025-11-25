'use client';

import {useState} from 'react';
import styles from "./page.module.css";

const DEFAULT_TEST_DATE = "2025-04-20"; // YYYY-MM-DD

export default function Home() {
  const [testDate, setTestDate] = useState<string>(DEFAULT_TEST_DATE);
  const [isEditingDate, setIsEditingDate] = useState(false);

  // Calculate formatted date and days left countdown
  let formatttedDate = "-";
  let daysLeft: number | null = null;
  if (testDate) {
    const test = new Date(testDate + "T00:00:00");
    const today = new Date();
    const startofToday = new Date (
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const diffMs = test.getTime() - startofToday.getTime();
    const msPerDay = 1000 * 60 * 60 * 24;
    daysLeft = Math.max(0, Math.ceil(diffMs / msPerDay));

    const month = 
    ))
  }
}
