import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { publicRoutes } from "./allRoutes";

const Index = () => {
  return (
    <Routes>
      {publicRoutes.map((route, idx) => (
        <Route
          path={route.path}
          element={<Suspense fallback={null}>{route.component}</Suspense>}
          key={idx}
        />
      ))}
    </Routes>
  );
};

export default Index;
