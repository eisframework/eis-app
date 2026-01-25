<script lang="ts">
  import Layout from '@components/Layout.svelte'
  import { Link, router } from '@inertiajs/svelte'

  let { auth, user, flash }: { 
    auth: { user: { id: number; name: string; email: string } | null }
    user: any
    flash?: { type: 'success' | 'error'; message: string }
  } = $props()

  let isDeleting = $state(false)

  function deleteUser() {
    if (confirm('Are you sure you want to delete this user?')) {
      isDeleting = true
      router.delete(`/users/${user.id}`, {
        onFinish: () => isDeleting = false
      })
    }
  }
</script>

<Layout {auth}>
  <div class="py-12">
    <div class="max-w-2xl mx-auto sm:px-6 lg:px-8">
      <div class="bg-card border border-border overflow-hidden rounded-lg">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-foreground">User Details</h1>
            {#if flash?.type === 'error'}
              <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">{flash.message}</div>
            {/if}
            {#if flash?.type === 'success'}
              <div class="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">{flash.message}</div>
            {/if}
            <div class="space-x-2">
              <Link
                href="/users/{user.id}/edit"
                class="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Edit
              </Link>
              <button
                onclick={deleteUser}
                disabled={isDeleting}
                class="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 disabled:opacity-50"
              >
                {#if isDeleting}
                  Deleting...
                {:else}
                  Delete
                {/if}
              </button>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <span class="block text-sm font-medium text-muted-foreground">ID</span>
              <p class="mt-1 text-sm text-foreground">{user.id}</p>
            </div>

            <div>
              <span class="block text-sm font-medium text-muted-foreground">Name</span>
              <p class="mt-1 text-sm text-foreground">{user.name}</p>
            </div>

            <div>
              <span class="block text-sm font-medium text-muted-foreground">Email</span>
              <p class="mt-1 text-sm text-foreground">{user.email}</p>
            </div>

            <div>
              <span class="block text-sm font-medium text-muted-foreground">Created At</span>
              <p class="mt-1 text-sm text-foreground">{new Date(user.createdAt).toLocaleString()}</p>
            </div>

            <div>
              <span class="block text-sm font-medium text-muted-foreground">Updated At</span>
              <p class="mt-1 text-sm text-foreground">{new Date(user.updatedAt).toLocaleString()}</p>
            </div>
          </div>

          <div class="mt-6">
            <Link
              href="/users"
              class="text-primary hover:text-primary/90"
            >
              &larr; Back to Users
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
</Layout>
