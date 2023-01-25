import { keyframes } from '@stitches/react';
import { writeText } from '@tauri-apps/api/clipboard';
import { useTranslation } from 'react-i18next';
import React, { memo, useEffect, useRef } from 'react';
import { Link, Grid, Typography, ContextMenu } from 'voxeliface';

import Avatar from './Avatar';

import { toast } from '../../util';
import { useInstance } from '../../voxura';
import { useAppDispatch } from '../../store/hooks';
import { INSTANCE_STATE_ICONS } from '../../util/constants';
import { setPage, setInstanceTab, setCurrentInstance } from '../../store/slices/interface';
const Animation = keyframes({
	'0%': {
		opacity: 0,
		transform: 'scale(.9) translateY(8px)'
	},
	'100%': {
		opacity: 1,
		transform: 'none'
	}
});
const viewAnimation = keyframes({
	'100%': {
		right: 0,
		opacity: 0,
		position: 'absolute',
		transform: 'translateX(100%)'
	}
});

export interface InstanceProps {
	id: string
	selected?: boolean
}
export default memo(({ id, selected }: InstanceProps) => {
	const ref = useRef<HTMLDivElement>(null);
	const { t } = useTranslation('interface');
	const dispatch = useAppDispatch();
	const instance = useInstance(id);
	useEffect(() => {
		if (selected)
			ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth'});
	}, [selected]);
	if (!instance)
		return null;

	const StateIcon = INSTANCE_STATE_ICONS[instance.state];
	const viewTab = (tab: number) => {
		view();
		dispatch(setInstanceTab(tab));
	};
	const favorite = () => instance.setCategory(t('mdpkm:instance_category.favorites'));
	const copyId = () => writeText(instance.id).then(() => toast('copied_id', [instance.name]));
	const view = () => {
		dispatch(setCurrentInstance(instance.id));
		dispatch(setPage('instances'));
	};
	
	return <ContextMenu.Root>
		<ContextMenu.Trigger asChild>
			<Grid ref={ref} width="100%" alignItems="start" css={{
				cursor: 'default',
				animation: `${Animation} 500ms cubic-bezier(0.4, 0, 0.2, 1)`,
				animationFillMode: 'forwards'
			}}>
				<Grid width="100%" height="100%" alignItems="center" borderRadius={16} justifyContent="space-between" css={{
					border: selected ? 'transparent solid 1px' : '$secondaryBorder solid 1px',
					overflow: 'hidden',
					background: selected ? '$gradientBackground2 padding-box, $gradientBorder2 border-box' : '$primaryBackground'
				}}>
					<Grid padding={8} spacing={12} alignItems="center" css={{
						overflow: 'hidden',
						position: 'relative'
					}}>
						<Avatar src={instance.webIcon} size="md"/>
						<Grid spacing={4} vertical alignItems="start" css={{ overflow: 'hidden' }}>
							<Grid spacing={4} alignItems="center">
								{instance.isFavourite && <IconBiStarFill fontSize={14}/>}
								<Typography
									width="100%"
									noFlex
									family="$tertiary"
									noSelect
									lineheight={1}
									whitespace="nowrap"
									css={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
								>
									{instance.name}
								</Typography>
							</Grid>
							<Typography
								size={12}
								color="$secondaryColor"
								weight={400}
								family="$secondary"
								spacing={6}
								noSelect
								lineheight={1}
							>
								<StateIcon fontSize={10} />
								{t(`instance.state.${instance.state}`)}
							</Typography>
						</Grid>
					</Grid>
					<Link size={12} height="100%" onClick={view} padding="0 16px" css={{
						animation: selected ? `${viewAnimation} .25s ease-in` : undefined,
						animationFillMode: 'forwards'
					}}>
						{t('common.action.view')}
						<IconBiArrowRight />
					</Link>
				</Grid>
			</Grid>
		</ContextMenu.Trigger>
		<ContextMenu.Content>
			<ContextMenu.MenuLabel>
				Instance Options ({instance.name})
			</ContextMenu.MenuLabel>
			<ContextMenu.MenuItem>
				<IconBiPlayFill/>
				{t('common.action.launch')}
			</ContextMenu.MenuItem>
			<ContextMenu.MenuItem onClick={view}>
				<IconBiZoomIn/>
				{t('common.action.view')}
			</ContextMenu.MenuItem>
			<ContextMenu.MenuSeparator/>
			<ContextMenu.MenuItem onClick={favorite}>
				<IconBiStar/>
				Add to Favourites
			</ContextMenu.MenuItem>
			<ContextMenu.MenuSeparator/>
			<ContextMenu.MenuItem onClick={() => viewTab(0)}>
				<IconBiInfoCircle/>
				{t('instance_page.tab.home')}
			</ContextMenu.MenuItem>
			<ContextMenu.MenuItem onClick={() => viewTab(1)}>
				<IconBiBox2/>
				{t('instance_page.tab.content')}
			</ContextMenu.MenuItem>
			<ContextMenu.MenuItem onClick={() => viewTab(2)}>
				<IconBiBox/>
				{t('instance_page.tab.game')}
			</ContextMenu.MenuItem>
			<ContextMenu.MenuItem onClick={() => viewTab(3)}>
				<IconBiGear/>
				{t('instance_page.settings')}
			</ContextMenu.MenuItem>
			<ContextMenu.MenuSeparator/>
			<ContextMenu.MenuItem onClick={copyId}>
				<IconBiClipboardPlus/>
				{t('common.action.copy_id')}
			</ContextMenu.MenuItem>
		</ContextMenu.Content>
	</ContextMenu.Root>;
});