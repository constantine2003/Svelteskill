<script lang="ts">
  import '../app.css';
  import Navbar from '$lib/components/layout/Navbar.svelte';
  import { supabase } from '$lib/supabase/client';
  import { invalidate } from '$app/navigation';
  import { onMount } from 'svelte';

  let { data, children } = $props();

  const profile = $derived(data.profile ?? null);

  onMount(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          invalidate('supabase:auth');
        }
      }
    );
    return () => subscription.unsubscribe();
  });
</script>

<Navbar user={profile} />

<div class="pt-14">
  {@render children()}
</div>