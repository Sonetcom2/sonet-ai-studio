type WelcomeProps = {
  fullName: string;
};

export default function Welcome({ fullName }: WelcomeProps) {
  return (
    <section className="mb-10">
      <h1 className="text-5xl font-black">
        👋 Welcome Back, {fullName}
      </h1>

      <p className="text-gray-400 mt-3 text-lg">
        Manage your AI creations from one intelligent dashboard.
      </p>
    </section>
  );
}