export function Home() {
  return (
    <main className="container">
      <h1>{{APP_NAME}}</h1>
      <p>Welcome to your RedwoodSDK app running on Cloudflare Workers.</p>

      <section>
        <h2>Getting Started</h2>
        <ul>
          <li>Edit <code>src/app/routes/Home.tsx</code> to modify this page</li>
          <li>Add routes in <code>src/worker.tsx</code></li>
          <li>Create Server Functions with <code>"use server"</code></li>
        </ul>
      </section>

      <section>
        <h2>Resources</h2>
        <ul>
          <li>
            <a href="https://docs.rwsdk.com/" target="_blank" rel="noopener">
              RedwoodSDK Documentation
            </a>
          </li>
          <li>
            <a href="https://developers.cloudflare.com/workers/" target="_blank" rel="noopener">
              Cloudflare Workers Docs
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
