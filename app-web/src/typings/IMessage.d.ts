export interface IMessage {
	id: string;
	content: string;
	sender: string;
	createdAt: string;
	isCreator?: boolean;
}
