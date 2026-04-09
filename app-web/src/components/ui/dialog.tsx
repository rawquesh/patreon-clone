import { Dialog as ChakraDialog, Portal } from "@chakra-ui/react";
import { CloseButton } from "./close-button";
import * as React from "react";

interface DialogContentProps extends ChakraDialog.ContentProps {
	portalled?: boolean;
	portalRef?: React.RefObject<HTMLElement>;
	backdrop?: boolean;
}

export const DialogContent = React.forwardRef<
	HTMLDivElement,
	DialogContentProps
>(function DialogContent(props, ref) {
	const {
		children,
		portalled = true,
		portalRef,
		backdrop = true,
		...rest
	} = props;

	return (
		<Portal disabled={!portalled} container={portalRef}>
			{backdrop && <ChakraDialog.Backdrop
				css={{
					background: "rgba(0, 0, 0, 0.35)",
					backdropFilter: "blur(6px)",
				}}
			/>}
			<ChakraDialog.Positioner>
				<ChakraDialog.Content
					borderRadius="16px"
					ref={ref}
					{...rest}
					asChild={false}
					css={{
						background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.92) 100%)",
						backdropFilter: "blur(24px)",
						border: "1px solid rgba(255,255,255,0.8)",
						boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
						position: "relative",
						overflow: "hidden",
						"&::before": {
							content: '""',
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							height: "3px",
							background: "var(--gradient-primary)",
						},
					}}
				>
					{children}
				</ChakraDialog.Content>
			</ChakraDialog.Positioner>
		</Portal>
	);
});

export const DialogCloseTrigger = React.forwardRef<
	HTMLButtonElement,
	ChakraDialog.CloseTriggerProps
>(function DialogCloseTrigger(props, ref) {
	return (
		<ChakraDialog.CloseTrigger
			position="absolute"
			top="3"
			insetEnd="3"
			{...props}
			asChild
		>
			<CloseButton size="sm" ref={ref}>
				{props.children}
			</CloseButton>
		</ChakraDialog.CloseTrigger>
	);
});

export const DialogRoot = ChakraDialog.Root;
export const DialogFooter = ChakraDialog.Footer;
export const DialogHeader = ChakraDialog.Header;
export const DialogBody = ChakraDialog.Body;
export const DialogBackdrop = ChakraDialog.Backdrop;
export const DialogTitle = ChakraDialog.Title;
export const DialogDescription = ChakraDialog.Description;
export const DialogTrigger = ChakraDialog.Trigger;
export const DialogActionTrigger = ChakraDialog.ActionTrigger;
