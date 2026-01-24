<script lang="ts">
  import Layout from '@components/Layout.svelte'

  let { auth = { user: null }, error = 'Page not found' }: { 
    auth: { user: { id: number; name: string; email: string } | null }
    error?: string 
  } = $props()
</script>

<Layout {auth}>
  <div class="py-12">
    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
      <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
        <div class="p-12 text-center">
          <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 class="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
          <p class="text-gray-600 mb-8">{error}</p>
          <a
            href="/"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  </div>
</Layout>
