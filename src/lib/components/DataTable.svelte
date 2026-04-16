<!-- DataTable.svelte — reusable data table with design-system styling -->
<script lang="ts">
  let { headers, rows, caption }: {
    headers: string[];
    rows: string[][];
    caption?: string;
  } = $props();
</script>

<div class="table-wrap">
  <table>
    {#if caption}
      <caption>{caption}</caption>
    {/if}
    <thead>
      <tr>
        {#each headers as h}
          <th>{h}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each rows as row}
        <tr>
          {#each row as cell}
            <td>{cell}</td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .table-wrap {
    overflow-x: auto;
    margin-block: 28px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    background: var(--deep);
    font-family: var(--font-body);
    font-size: 14px;
  }

  caption {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 1px;
    color: var(--sub);
    text-align: left;
    padding: 0 0 8px 0;
    caption-side: top;
  }

  thead tr {
    background: var(--panel);
    border-bottom: 2px solid var(--teal);
  }

  th {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 2px;
    color: var(--teal);
    text-transform: uppercase;
    padding: 10px 14px;
    text-align: left;
    white-space: nowrap;
  }

  td {
    padding: 10px 14px;
    color: var(--text);
    border-bottom: 1px solid var(--dim);
    vertical-align: top;
    line-height: 1.45;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover {
    background: rgba(0, 200, 200, 0.03);
  }
</style>
