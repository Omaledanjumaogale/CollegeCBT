<script lang="ts">
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '$lib/services/convexClient';
	import { fade, slide } from 'svelte/transition';
	import { showToast } from '$lib/stores';
	import { tick } from 'svelte';

	let client = useConvexClient();

	// ── Real-time Active Channels Sync ──
	const channelsQuery = useQuery(api.support.getActiveChats, {});
	let channels = $derived(channelsQuery.data || []);
	let isChannelsLoading = $derived(channelsQuery.isLoading);

	// Currently active channel
	let selectedUserId = $state<string | null>(null);
	let replyText = $state('');
	let showEmojiMenu = $state(false);
	let attachmentData = $state<{ url: string; name: string } | null>(null);
	let isUploading = $state(false);
	let messageContainer: HTMLDivElement | null = $state(null);

	const EMOJIS = ['👋', '✅', '❌', '⚠️', '💯', '🚀', '💡', '👍', '🙏', '🔧', '📦', '⭐'];
	const TEMPLATES = [
		'Hello! How can we assist you today?',
		'Thanks for reaching out! We are looking into this.',
		'This issue should be resolved now. Please refresh the page.',
		'To help us debug, could you please share a screenshot or error message?'
	];

	// Sync active message thread
	const messagesQuery = useQuery(api.support.getMessages, () => ({
		userId: selectedUserId || ''
	}));
	let messages = $derived(messagesQuery.data || []);

	// Active user profile (derived from active channel info)
	let activeChannel = $derived(channels.find(c => c.userId === selectedUserId) || null);

	// Auto-scroll to bottom of chat
	$effect(() => {
		if (messages.length && messageContainer) {
			tick().then(() => {
				if (messageContainer) {
					messageContainer.scrollTop = messageContainer.scrollHeight;
				}
			});
		}
	});

	async function handleSendReply() {
		if ((!replyText.trim() && !attachmentData) || !selectedUserId) return;

		const textToSend = replyText.trim();
		const attachment = attachmentData;

		// Reset inputs immediately
		replyText = '';
		attachmentData = null;
		showEmojiMenu = false;

		try {
			await client.mutation(api.support.sendAdminMessage, {
				userId: selectedUserId,
				adminName: 'Super Admin',
				text: textToSend || `Sent attachment: ${attachment?.name}`,
				attachmentUrl: attachment?.url,
				attachmentName: attachment?.name
			});
		} catch (err) {
			console.error('[SupportDesk] Send failed:', err);
			showToast('❌ Send Failed', 'Unable to deliver message.', 'error');
		}
	}

	function handleKeyPress(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSendReply();
		}
	}

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		if (file.size > 2 * 1024 * 1024) {
			showToast('⚠️ File Too Large', 'Images must be smaller than 2MB.', 'warning');
			return;
		}

		isUploading = true;
		const reader = new FileReader();
		reader.onload = () => {
			attachmentData = {
				url: reader.result as string,
				name: file.name
			};
			isUploading = false;
			showToast('📎 Attachment Added', file.name, 'success');
		};
		reader.readAsDataURL(file);
	}

	async function handleClearHistory() {
		if (!selectedUserId) return;
		if (!confirm('Are you sure you want to delete this support chat history?')) return;

		try {
			await client.mutation(api.support.clearChatHistory, { userId: selectedUserId });
			selectedUserId = null;
			showToast('🗑️ Thread Cleared', 'Support history deleted successfully.', 'success');
		} catch (err) {
			showToast('❌ Action Failed', 'Could not clear history.', 'error');
		}
	}

	function applyTemplate(tmpl: string) {
		replyText = tmpl;
	}
</script>

<svelte:head>
	<title>Support Desk — CollegeCBT Operations</title>
</svelte:head>

<div class="space-y-8">
	<!-- Header -->
	<div>
		<h1 class="font-display text-3xl text-white mb-2">Support Desk</h1>
		<p class="text-white/40 text-sm">Real-time student communications and AI-assisted troubleshooting.</p>
	</div>

	<!-- Workspace Layout -->
	<div class="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-8 h-[650px] items-stretch">
		<!-- Channel Sidebar -->
		<div class="glass-card flex flex-col overflow-hidden border border-white/5 bg-[#0D0820]/45">
			<div class="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
				<h3 class="font-bold text-white text-xs uppercase tracking-wider">Conversations</h3>
				<span class="text-[10px] bg-violet-500/20 text-violet-300 font-bold px-2 py-0.5 rounded">
					{channels.length} Channels
				</span>
			</div>

			<!-- Search / Filter (Visual Placeholder for robust design) -->
			<div class="p-3 border-b border-white/5 bg-black/10">
				<input
					type="text"
					placeholder="Search by student name..."
					class="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-all"
				/>
			</div>

			<!-- Channels List -->
			<div class="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
				{#if isChannelsLoading}
					<div class="h-40 flex items-center justify-center text-white/20 animate-pulse text-xs">
						Synchronizing communications channel...
					</div>
				{:else if channels.length === 0}
					<div class="p-8 text-center text-white/30 text-xs">
						No active support tickets.
					</div>
				{:else}
					{#each channels as ch}
						<button
							onclick={() => selectedUserId = ch.userId}
							class="w-full text-left p-4 flex items-start gap-3 hover:bg-white/[0.03] transition-colors relative {selectedUserId === ch.userId ? 'bg-white/[0.04]' : ''}"
						>
							{#if selectedUserId === ch.userId}
								<div class="absolute left-0 top-0 bottom-0 w-1 bg-violet-500"></div>
							{/if}
							
							<div class="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-lg flex-shrink-0 relative">
								🎓
								{#if ch.userPlan === 'pro'}
									<span class="absolute -top-1 -right-1 w-4.5 h-4.5 bg-lime-500 rounded-full border border-[#0d0820] flex items-center justify-center text-[8px] font-black text-black">
										★
									</span>
								{/if}
							</div>

							<div class="flex-1 min-w-0">
								<div class="flex items-center justify-between mb-1">
									<span class="text-xs font-bold text-white truncate max-w-[140px]">
										{ch.userName}
									</span>
									<span class="text-[9px] text-white/30">
										{new Date(ch.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
									</span>
								</div>
								
								<p class="text-[11px] text-white/50 truncate mb-1">
									{ch.lastMessage}
								</p>

								<div class="flex items-center gap-1.5">
									{#if ch.userPlan === 'pro'}
										<span class="text-[8px] font-bold text-lime-500 uppercase tracking-widest bg-lime-500/5 px-1 rounded border border-lime-500/20">
											Priority Pro
										</span>
									{:else}
										<span class="text-[8px] text-white/40 uppercase tracking-widest">
											Free Tier
										</span>
									{/if}
								</div>
							</div>
						</button>
					{/each}
				{/if}
			</div>
		</div>

		<!-- Chat Pane -->
		<div class="glass-card flex flex-col overflow-hidden border border-white/5 bg-[#0D0820]/45">
			{#if !selectedUserId}
				<div class="flex-1 flex flex-col items-center justify-center text-center p-8 text-white/30 gap-3">
					<div class="text-4xl">💬</div>
					<div>
						<h3 class="font-bold text-white/60 text-sm mb-1">No Active Chat Selected</h3>
						<p class="text-xs max-w-[280px] mx-auto leading-relaxed">
							Click on a channel in the sidebar to review tickets and send responses.
						</p>
					</div>
				</div>
			{:else}
				<!-- Header -->
				<div class="px-6 py-4 border-b border-white/5 bg-black/20 flex items-center justify-between flex-shrink-0">
					<div class="flex items-center gap-3">
						<div class="w-9 h-9 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-lg">
							🎓
						</div>
						<div>
							<h3 class="font-bold text-white text-sm">
								{activeChannel?.userName || 'Anonymous Student'}
							</h3>
							<p class="text-[10px] text-white/40">
								UID: <span class="font-mono">{selectedUserId}</span> · {activeChannel?.userEmail}
							</p>
						</div>
					</div>
					<button
						onclick={handleClearHistory}
						class="text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 transition-all"
					>
						Delete Thread
					</button>
				</div>

				<!-- Message Feed -->
				<div
					bind:this={messageContainer}
					class="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-black/5"
				>
					{#each messages as msg}
						<div class="flex flex-col {msg.sender === 'admin' ? 'items-end' : 'items-start'}">
							<!-- Identity -->
							<span class="text-[9px] text-white/30 mb-0.5 px-1">
								{msg.sender === 'admin' ? 'You' : msg.senderName}
							</span>

							<!-- Bubble -->
							<div
								class="max-w-[70%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed"
								style={
									msg.sender === 'admin'
										? 'background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white;'
										: msg.sender === 'ai'
										? 'background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.25); color: #f3e8ff;'
										: 'background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0;'
								}
							>
								{#if msg.attachmentUrl}
									<div class="mb-2 rounded-lg overflow-hidden border border-white/10 max-h-[180px]">
										<img src={msg.attachmentUrl} alt="User attachment" class="object-cover w-full h-full" />
									</div>
								{/if}
								<div>{msg.text}</div>
							</div>

							<!-- Timestamp -->
							<span class="text-[8px] text-white/20 mt-1 px-1">
								{new Date(msg.timestamp).toLocaleString()}
							</span>
						</div>
					{/each}
				</div>

				<!-- Quick Templates -->
				<div class="px-6 py-2 border-t border-white/5 bg-black/10 flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none flex-shrink-0">
					<span class="text-[9px] font-bold text-white/30 uppercase tracking-wider mr-2">Templates:</span>
					{#each TEMPLATES as tmpl}
						<button
							onclick={() => applyTemplate(tmpl)}
							class="text-[10px] bg-white/5 hover:bg-white/10 border border-white/5 text-white/70 hover:text-white px-2.5 py-1 rounded-md transition-colors"
						>
							{tmpl}
						</button>
					{/each}
				</div>

				<!-- Input & Composer Zone -->
				<div class="p-4 border-t border-white/5 bg-black/25 flex flex-col gap-2 flex-shrink-0">
					{#if attachmentData}
						<div transition:slide class="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
							<div class="flex items-center gap-2 min-w-0">
								<div class="w-8 h-8 rounded overflow-hidden border border-white/10 bg-black flex-shrink-0">
									<img src={attachmentData.url} alt="Admin attachment preview" class="w-full h-full object-cover" />
								</div>
								<span class="text-xs text-white/60 truncate">{attachmentData.name}</span>
							</div>
							<button onclick={() => attachmentData = null} class="text-white/40 hover:text-white text-xs p-1">✕</button>
						</div>
					{/if}

					{#if showEmojiMenu}
						<div transition:slide class="p-2 bg-white/5 rounded-lg border border-white/5 flex gap-2 justify-center">
							{#each EMOJIS as emoji}
								<button
									onclick={() => { replyText += emoji; showEmojiMenu = false; }}
									class="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded transition-colors text-sm"
								>
									{emoji}
								</button>
							{/each}
						</div>
					{/if}

					<div class="flex items-center gap-2.5">
						<!-- Attachment Button -->
						<label class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-white/40 hover:text-white cursor-pointer transition-all flex-shrink-0">
							📎
							<input
								type="file"
								accept="image/*"
								class="hidden"
								onchange={handleFileChange}
								disabled={isUploading}
							/>
						</label>

						<!-- Emoji Button -->
						<button
							onclick={() => showEmojiMenu = !showEmojiMenu}
							class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all flex-shrink-0"
						>
							😀
						</button>

						<!-- Textbox -->
						<input
							type="text"
							bind:value={replyText}
							onkeypress={handleKeyPress}
							placeholder="Type a response to this student..."
							class="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors"
						/>

						<!-- Submit -->
						<button
							onclick={handleSendReply}
							disabled={!replyText.trim() && !attachmentData}
							class="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all flex-shrink-0"
							style="background: linear-gradient(135deg, #7c3aed, #a855f7);"
							class:opacity-50={!replyText.trim() && !attachmentData}
						>
							✈️
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
