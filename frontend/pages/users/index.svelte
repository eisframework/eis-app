<script lang="ts">
  import Layout from '@components/Layout.svelte'
  import { Link } from '@inertiajs/svelte'

  let { auth, users = [] }: { 
    auth: { user: { id: number; name: string; email: string } | null }
    users?: Array<any> 
  } = $props()
</script>

<Layout {auth}>
  <div class="py-12">
    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
      <div class="bg-card border border-border overflow-hidden rounded-lg">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-foreground">Users</h1>
            <Link
              href="/users/create"
              class="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Create User
            </Link>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-border">
              <thead class="bg-muted">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Created At
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-card divide-y divide-border">
                {#each users as user}
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-foreground">{user.name}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-muted-foreground">{user.email}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href="/users/{user.id}" class="text-primary hover:text-primary/90 mr-4">
                        View
                      </Link>
                      <Link href="/users/{user.id}/edit" class="text-primary hover:text-primary/90">
                        Edit
                      </Link>
                    </td>
                  </tr>
                {:else}
                  <tr>
                    <td colspan="4" class="px-6 py-4 text-center text-sm text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</Layout>
