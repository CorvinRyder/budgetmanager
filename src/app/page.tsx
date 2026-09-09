import { cookies } from "next/headers";
import HomeContainer from "./homepage/HomeContainer";
import LoginForm from "./homepage/login/LoginForm";
import HomepageMenu from "./homepage/HomepageMenu";

export default async function Home() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get("session-token") !== undefined;

  return (
    <HomeContainer>
      {isLoggedIn ? <HomepageMenu /> : <LoginForm />}
    </HomeContainer>
  );
}
