<script lang="ts">
  import Layout from '@components/Layout.svelte'
  import { Link } from '@inertiajs/svelte'

  let { auth = { user: null } }: { auth: { user: { id: number; name: string; email: string } | null } } = $props()
</script>

<Layout {auth}>
  <div class="min-h-screen bg-slate-950 text-white">
    <section class="py-20">
      <div class="container mx-auto px-6 max-w-4xl">
        <h1 class="text-5xl font-bold mb-8">About Laju</h1>
        <div class="prose prose-invert prose-lg">
          <p class="text-slate-300 text-lg leading-relaxed mb-6">
            Laju is a hyper-performance TypeScript monolith framework designed for modern full-stack development. Built on the fastest tools in the Node.js ecosystem, Laju combines the raw speed of HyperExpress, the reactivity of Svelte 5, and the seamless glue of Inertia.js.
          </p>
          <p class="text-slate-300 text-lg leading-relaxed mb-6">
            Our mission is to provide developers with a framework that doesn't compromise on performance while maintaining the simplicity of a monolithic architecture.
          </p>
          
          <h2 class="text-3xl font-bold mt-12 mb-6">Our Philosophy</h2>
          <ul class="space-y-3 text-slate-300">
            <li>• Performance without compromise</li>
            <li>• Type safety from top to bottom</li>
            <li>• Developer experience first</li>
            <li>• Modern tooling, modern standards</li>
          </ul>

          <h2 class="text-3xl font-bold mt-12 mb-6">The Team</h2>
          <p class="text-slate-300 text-lg leading-relaxed">
            Built by developers who care about performance and developer experience. We're constantly improving Laju based on community feedback and real-world usage.
          </p>
        </div>

        <div class="mt-12">
          <Link href="/" class="text-brand-500 hover:text-brand-400 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </section>
  </div>
</Layout>
