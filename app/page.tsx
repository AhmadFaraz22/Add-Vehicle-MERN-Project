import { redirect } from "next/navigation";
import Cookies from "js-cookie";

export default function Home() {
  Cookies.remove("authToken");
  Cookies.remove("refreshToken");
  redirect("/login");
}
