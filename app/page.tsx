'use client'

import React, { useState, useEffect } from 'react'
import Index from "@/pages/Index"
import LoadingSpinner from "@/components/LoadingSpinner"

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cohesive storytelling timeline
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 6000); // 6 seconds for complete narrative

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <Index />;
} 