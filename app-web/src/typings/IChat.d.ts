export interface IChat {
	id: string;
	title: string;
	lastMessage?: string;
	timestamp: string;
	sender: string;
	hasEmoji?: boolean;
}
