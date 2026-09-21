<script lang="ts">
	import { expectedIncome, formatMoney, stageOf } from '$lib/game/economy';
	import type { Action, RunState } from '$lib/game/types';

	let { run, dispatch }: { run: RunState; dispatch: (a: Action) => void } = $props();

	const stage = $derived(stageOf(run));
	const income = $derived(expectedIncome(run));
	const saving = $derived(Math.max(0, income - run.need - run.want));

	// TODO(plan-preset): "same as last month" and the 50/30/20 preset (ticket 04)
	// land with the plan-slice; they need the last plan carried on the Run state.
</script>

<section class="card border border-base-300 bg-base-100">
	<div class="card-body gap-4 p-4">
		<div>
			<h2 class="font-semibold">The plan</h2>
			<p class="text-sm opacity-60">Decide before the month decides for you.</p>
		</div>

		<label class="block">
			<span class="flex justify-between text-sm">
				<span>Work hours</span>
				<span class="font-semibold tabular-nums">{run.hours}h</span>
			</span>
			<input
				type="range"
				class="range range-sm range-primary"
				min="0"
				max={stage.freeTime}
				value={run.hours}
				oninput={(e) => dispatch({ type: 'SET_HOURS', hours: Number(e.currentTarget.value) })}
			/>
		</label>

		<label class="block">
			<span class="flex justify-between text-sm">
				<span>Need</span>
				<span class="font-semibold tabular-nums">{formatMoney(run.need)}</span>
			</span>
			<input
				type="range"
				class="range range-sm range-primary"
				min="0"
				max={Math.max(income, 1)}
				step="5"
				value={run.need}
				oninput={(e) => dispatch({ type: 'SET_NEED', amount: Number(e.currentTarget.value) })}
			/>
		</label>

		<label class="block">
			<span class="flex justify-between text-sm">
				<span>Want</span>
				<span class="font-semibold tabular-nums">{formatMoney(run.want)}</span>
			</span>
			<input
				type="range"
				class="range range-sm range-primary"
				min="0"
				max={Math.max(income, 1)}
				step="5"
				value={run.want}
				oninput={(e) => dispatch({ type: 'SET_WANT', amount: Number(e.currentTarget.value) })}
			/>
		</label>

		<dl class="text-sm">
			<div class="flex justify-between border-t border-dashed border-base-300 py-1">
				<dt class="opacity-60">Income</dt>
				<dd class="tabular-nums">{formatMoney(income)}</dd>
			</div>
			<div class="flex justify-between border-t border-dashed border-base-300 py-1">
				<dt class="opacity-60">Save (left over)</dt>
				<dd class="tabular-nums">{formatMoney(saving)}</dd>
			</div>
		</dl>

		<button class="btn btn-primary" onclick={() => dispatch({ type: 'CONFIRM_PLAN' })}>
			Start the month
		</button>
	</div>
</section>
