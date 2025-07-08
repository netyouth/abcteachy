'use client'

import React, { useState, useEffect } from 'react'
import Index from "@/pages/Index"
import { ABCTeachyLoader } from "@/components/ABCTeachyLoader"

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <ABCTeachyLoader
        loading={isLoading}
        onComplete={handleLoadingComplete}
        duration={1000}
        autoComplete={true}
        autoCompleteDelay={7000}
      />
    );
  }

  return <Index />;
} 