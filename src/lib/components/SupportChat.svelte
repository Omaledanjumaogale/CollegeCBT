<script lang="ts">
	import { currentUser, isAuthenticated, showToast } from '$lib/stores';
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '$lib/services/convexClient';
	import { fade, slide } from 'svelte/transition';
	import { onMount, tick } from 'svelte';

	let client = useConvexClient();
	let isOpen = $state(false);
	let messageText = $state('');
	let isUploading = $state(false);
	let attachmentData = $state<{ url: string; name: string } | null>(null);
	let showEmojiMenu = $state(false);
	let messageContainer: HTMLDivElement | null = $state(null);

	// Emojis for quick support interaction
	const EMOJIS = ['👋', '❓', '💻', '📚', '🎯', '💯', '🚀', '🔥', '👍', '🙏', '💡', '⚠️'];

	// ── Real-time Messages Sync ──
	const messagesQuery = useQuery(api.support.getMessages, () => ({
		userId: $currentUser?.uid || ''
	}));

	let messages = $derived(messagesQuery.data || []);
	let isLoaded = $derived(!messagesQuery.isLoading);

	// Auto-scroll to bottom on new messages
	$effect(() => {
		if (messages.length && messageContainer) {
			tick().then(() => {
				if (messageContainer) {
					messageContainer.scrollTop = messageContainer.scrollHeight;
				}
			});
		}
	});

	// Trigger scroll when drawer opens
	$effect(() => {
		if (isOpen && messageContainer) {
			tick().then(() => {
				if (messageContainer) {
					messageContainer.scrollTop = messageContainer.scrollHeight;
				}
			});
		}
	});

	async function handleSend() {
		if ((!messageText.trim() && !attachmentData) || !$currentUser) return;

		const textToSend = messageText.trim();
		const name = $currentUser.displayName || 'Active Student';
		const uid = $currentUser.uid;

		// Clear inputs immediately for better perceived speed
		messageText = '';
		const currentAttachment = attachmentData;
		attachmentData = null;
		showEmojiMenu = false;

		try {
			await client.mutation(api.support.sendMessage, {
				userId: uid,
				senderName: name,
				text: textToSend || `Sent an attachment: ${currentAttachment?.name}`,
				attachmentUrl: currentAttachment?.url,
				attachmentName: currentAttachment?.name
			});
		} catch (error) {
			console.error('[SupportChat] Send failed:', error);
			showToast('❌ Send Failed', 'Unable to send message. Please try again.', 'error');
		}
	}

	function handleKeyPress(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	}

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		// Size limit: 2MB
		if (file.size > 2 * 1024 * 1024) {
			showToast('⚠️ File Too Large', 'Please upload an image smaller than 2MB.', 'warning');
			return;
		}

		// Check if it's an image
		if (!file.type.startsWith('image/')) {
			showToast('⚠️ Invalid File Type', 'Only image files are supported as attachments.', 'warning');
			return;
		}

		isUploading = true;
		const reader = new FileReader();
		reader.onload = () => {
			attachmentData = {
				url: reader.result as string, // base64 string
				name: file.name
			};
			isUploading = false;
			showToast('📎 Attachment Added', file.name, 'success');
		};
		reader.onerror = () => {
			isUploading = false;
			showToast('❌ Upload Error', 'Could not read the selected image file.', 'error');
		};
		reader.readAsDataURL(file);
	}

	function insertEmoji(emoji: string) {
		messageText += emoji;
		showEmojiMenu = false;
	}
</script>

{#if $isAuthenticated && $currentUser}
	<!-- Floating Action Button -->
	<button
		onclick={() => isOpen = !isOpen}
		class="fixed bottom-6 right-6 z-[9998] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 group focus:outline-none"
		style="background: linear-gradient(135deg, #7c3aed, #a855f7); border: 2px solid rgba(255,255,255,0.15);"
		aria-label="Open support chat"
	>
		<!-- Unread Badge (Simulated or count from messages) -->
		{#if messages.length > 0 && messages[messages.length - 1].sender !== 'student' && !isOpen}
			<span class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-lime-DEFAULT text-[10px] font-bold text-black flex items-center justify-center animate-bounce">
				1
			</span>
		{/if}
		
		{#if isOpen}
			<span class="text-xl text-white">✕</span>
		{:else}
			<span class="text-2xl text-white group-hover:rotate-12 transition-transform">💬</span>
		{/if}
	</button>

	<!-- Chat Window -->
	{#if isOpen}
		<div
			transition:fade={{ duration: 150 }}
			class="fixed bottom-24 right-6 z-[9997] w-[92vw] sm:w-[380px] h-[500px] rounded-2xl glass-card border border-white/10 flex flex-col shadow-2xl overflow-hidden"
			style="background: rgba(13, 8, 32, 0.95); backdrop-filter: blur(20px);"
		>
			<!-- Header -->
			<div class="px-5 py-4 border-b border-white/10 flex items-center justify-between" style="background: linear-gradient(90deg, rgba(124,58,237,0.15), rgba(168,85,247,0.05));">
				<div class="flex items-center gap-3">
					<div class="relative w-9 h-9 rounded-full bg-violet-600/30 flex items-center justify-center text-lg border border-violet-500/30">
						🤖
						<span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-lime-DEFAULT border-2 border-[#0d0820] animate-pulse"></span>
					</div>
					<div>
						<div class="font-bold text-sm text-white flex items-center gap-1.5">
							E-Win Support Hub
							<span class="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-semibold uppercase tracking-wider">Real-time</span>
						</div>
						<div class="text-[10px] text-white/50 flex items-center gap-1">
							<span>Online</span>
							<span class="w-1 h-1 rounded-full bg-white/30"></span>
							<span>AI-assisted</span>
						</div>
					</div>
				</div>
				<button
					onclick={() => isOpen = false}
					class="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
					aria-label="Close chat"
				>
					✕
				</button>
			</div>

			<!-- Messages List -->
			<div
				bind:this={messageContainer}
				class="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-white/10"
			>
				{#if !isLoaded}
					<div class="h-full flex flex-col items-center justify-center text-white/40 gap-2">
						<div class="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
						<span class="text-xs">Connecting to support channel...</span>
					</div>
				{:else if messages.length === 0}
					<div class="h-full flex flex-col items-center justify-center text-center p-6 text-white/40 gap-3">
						<span class="text-3xl">👋</span>
						<div>
							<div class="font-bold text-sm text-white/60 mb-0.5">Start a Conversation</div>
							<div class="text-xs max-w-[220px] mx-auto leading-relaxed">Ask any questions about pricing, exams, course content, or platform bugs. We are here to help!</div>
						</div>
					</div>
				{:else}
					{#each messages as msg}
						<div class="flex flex-col {msg.sender === 'student' ? 'items-end' : 'items-start'}">
							<!-- Sender Badge -->
							<span class="text-[9px] text-white/30 mb-0.5 px-1">
								{msg.sender === 'student' ? 'You' : msg.senderName}
							</span>
							
							<!-- Message Bubble -->
							<div
								class="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
								style={
									msg.sender === 'student'
										? 'background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #ffffff;'
										: msg.sender === 'ai'
										? 'background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.25); color: #f3e8ff;'
										: 'background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0;'
								}
							>
								{#if msg.attachmentUrl}
									<div class="mb-2 rounded-lg overflow-hidden border border-white/10 max-h-[140px]">
										<img src={msg.attachmentUrl} alt={msg.attachmentName || 'Attachment'} class="object-cover w-full h-full" />
									</div>
								{/if}
								<div>{msg.text}</div>
							</div>

							<!-- Timestamp -->
							<span class="text-[8px] text-white/20 mt-0.5 px-1.5">
								{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
							</span>
						</div>
					{/each}
				{/if}
			</div>

			<!-- Quick Actions / Input Zone -->
			<div class="p-3 border-t border-white/10 flex flex-col gap-2 bg-[#080417]/80">
				<!-- Emoji & Attachment Previews -->
				{#if attachmentData}
					<div transition:slide={{ duration: 150 }} class="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
						<div class="flex items-center gap-2 min-w-0">
							<div class="w-8 h-8 rounded overflow-hidden border border-white/10 bg-black flex-shrink-0">
								<img src={attachmentData.url} alt="Upload preview" class="w-full h-full object-cover" />
							</div>
							<span class="text-xs text-white/60 truncate">{attachmentData.name}</span>
						</div>
						<button
							onclick={() => attachmentData = null}
							class="text-white/40 hover:text-white text-xs p-1"
							aria-label="Remove attachment"
						>
							✕
						</button>
					</div>
				{/if}

				{#if showEmojiMenu}
					<div transition:slide={{ duration: 150 }} class="p-2 bg-white/5 rounded-xl border border-white/10 flex flex-wrap gap-1.5 justify-center">
						{#each EMOJIS as emoji}
							<button
								onclick={() => insertEmoji(emoji)}
								class="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded text-base transition-colors"
							>
								{emoji}
							</button>
						{/each}
					</div>
				{/if}

				<!-- Input Fields -->
				<div class="flex items-center gap-2">
					<!-- Attachment Input -->
					<label
						class="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-white/40 hover:text-white cursor-pointer transition-colors border border-white/5 flex-shrink-0"
						title="Upload image attachment"
					>
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
						class="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors border border-white/5 flex-shrink-0"
						title="Insert emoji"
					>
						😀
					</button>

					<!-- Text Input -->
					<input
						type="text"
						bind:value={messageText}
						onkeypress={handleKeyPress}
						placeholder="Ask support a question..."
						class="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors"
						maxlength="1000"
					/>

					<!-- Send Button -->
					<button
						onclick={handleSend}
						disabled={!messageText.trim() && !attachmentData}
						class="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all flex-shrink-0 focus:outline-none"
						style="background: linear-gradient(135deg, #7c3aed, #a855f7);"
						class:opacity-50={!messageText.trim() && !attachmentData}
						title="Send message"
					>
						✈️
					</button>
				</div>
			</div>
		</div>
	{/if}
{/if}
