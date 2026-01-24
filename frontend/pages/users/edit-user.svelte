<script lang="ts">
  import Layout from '@components/Layout.svelte'
  import TextInput from '@components/TextInput.svelte'
  import { Link, router } from '@inertiajs/svelte'

  let { auth, user, flash }: { 
    auth: { user: { id: number; name: string; email: string } | null }
    user: any
    flash?: { type: 'success' | 'error'; message: string }
  } = $props()

  let form = $state({
    name: user.name,
    email: user.email,
    password: ''
  })

  let isLoading = $state(false)

  function submit() {
    isLoading = true
    router.put(`/users/${user.id}`, form, {
      onFinish: () => isLoading = false
    })
  }
</script>

<Layout {auth}>
  <div class="py-12">
    <div class="max-w-md mx-auto sm:px-6 lg:px-8">
      <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
        <div class="p-6">
          <h1 class="text-2xl font-bold text-gray-900 mb-6">Edit User</h1>

          {#if flash?.type === 'error'}
            <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">{flash.message}</div>
          {/if}
          {#if flash?.type === 'success'}
            <div class="p-4 bg-green-500/10 border border-green-500/20 rounded-lg mb-4">{flash.message}</div>
          {/if}

          <form onsubmit={(e) => { e.preventDefault(); submit(); }}>
            <TextInput
              name="name"
              type="text"
              label="Name"
              value={form.name}
              oninput={(e) => form.name = (e.target as HTMLInputElement).value}
              required
            />

            <TextInput
              name="email"
              type="email"
              label="Email"
              value={form.email}
              oninput={(e) => form.email = (e.target as HTMLInputElement).value}
              required
            />

            <TextInput
              name="password"
              type="password"
              label="Password (leave blank to keep current)"
              value={form.password}
              oninput={(e) => form.password = (e.target as HTMLInputElement).value}
            />

            <div class="flex justify-between items-center mt-4">
              <Link
                href="/users"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {#if isLoading}
                  Updating...
                {:else}
                  Update User
                {/if}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</Layout>
