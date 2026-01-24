<script lang="ts">
  import Layout from '@components/Layout.svelte'

  let { auth }: { auth: { user: { id: number; name: string; email: string } | null } } = $props()
</script>

<Layout {auth}>
  <div class="py-12">
    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
      <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
        <div class="p-6 bg-white border-b border-gray-200">
          <h1 class="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>

          <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h2 class="text-lg font-semibold text-indigo-900 mb-2">
              Welcome back, {auth.user?.name}!
            </h2>
            <p class="text-indigo-700">
              You are logged in with email: {auth.user?.email}
            </p>
          </div>

          <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white border border-gray-200 rounded-lg p-4">
              <h3 class="font-semibold text-gray-900">Total Users</h3>
              <p class="text-3xl font-bold text-indigo-600 mt-2">-</p>
            </div>

            <div class="bg-white border border-gray-200 rounded-lg p-4">
              <h3 class="font-semibold text-gray-900">Active Sessions</h3>
              <p class="text-3xl font-bold text-green-600 mt-2">-</p>
            </div>

            <div class="bg-white border border-gray-200 rounded-lg p-4">
              <h3 class="font-semibold text-gray-900">Account Status</h3>
              <p class="text-lg font-semibold text-green-600 mt-2">Active</p>
            </div>
          </div>

          <div class="mt-6">
            <a
              href="/users"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              Manage Users
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</Layout>
