import { Suspense } from "react";
import LoginPages from "./page-component";

export default function Login() {
  return (
    <Suspense>
      <LoginPages />;
    </Suspense>
  );
}
