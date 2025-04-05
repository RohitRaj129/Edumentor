"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import React, { Suspense } from "react";
import AuthProvider from "./AuthProvider";

function Provider({ children }) {
  const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);
  return (
    <ConvexProvider client={convex}>
      <Suspense fallback={<div>Loading...</div>}>
        <AuthProvider>{children}</AuthProvider>
      </Suspense>
    </ConvexProvider>
  );
}

export default Provider;
