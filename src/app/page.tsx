import { cookies } from "next/headers";
import HomeContainer from "./landingpage/HomeContainer";
import LoginForm from "./landingpage/login/LoginForm";
import HomepageMenu from "./landingpage/HomepageMenu";
import RegisterForm from "./landingpage/register/RegisterForm";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const isRegister = !!(await searchParams).signup;
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get("session-token") !== undefined;
  return (
    <HomeContainer>
      {isRegister ? (
        <RegisterForm />
      ) : isLoggedIn ? (
        <HomepageMenu />
      ) : (
        <LoginForm />
      )}
    </HomeContainer>
  );
}
