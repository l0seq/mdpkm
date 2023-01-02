import { open } from '@tauri-apps/api/shell';
import { writeText } from '@tauri-apps/api/clipboard';
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { Grid, Button, Spinner, Tooltip, Typography, ContextMenu, BasicSpinner } from 'voxeliface';

import ImageWrapper from './ImageWrapper';

import { toast } from '../../util';
import { useAppSelector } from '../../store/hooks';
import { useStoredValue } from '../../../voxura/src/storage';
import { CompatibilityError } from '../../../voxura/src/instance';
import { Mod, Project, Platform, Instance, ProjectSide, VoxuraStore } from '../../../voxura';
export interface ModProps {
    id?: string
    data?: Project<any, Platform<any>> & Mod
    featured?: boolean
	platform?: Platform<any>
    instance?: Instance
    recommended?: boolean
}
export default function ModComponent({ id, data, featured, platform, instance, recommended }: ModProps) {
    const { t } = useTranslation('interface');
	const projects = useStoredValue<VoxuraStore["projects"]>('projects', {});
    const isCompact = useAppSelector(state => state.settings.uiStyle) === 'compact';
    const showSummary = useAppSelector(state => state.settings['instances.modSearchSummaries']);
    const [mod, setMod] = useState(data);
    const [loading, setLoading] = useState(!data);
    const installed = instance ? Object.entries(projects).filter(e => instance.modifications.some(m => m.md5 === e[0])).some(e => e[1].id === (id ?? data?.id)) : false;
    const installing = false;//downloading?.some(d => d.id === (mod?.id ?? mod?.project_id));
    const installMod = () => instance?.installMod(mod!).catch(err => {
		if (err instanceof CompatibilityError)
			toast('project_incompatible', [mod?.displayName]);
		else
			toast('download_fail', [mod?.displayName]);
		throw err;
	});
	const openAuthor = () => open(mod!.source.baseUserURL + mod!.author)
	const openWebsite = () => open(mod!.website);
    useEffect(() => {
        if(id && platform && !mod)
			platform.getMod(id).then(mod => {
				setMod(mod);
				setLoading(false);
			});
    }, [id, mod, platform]);
    useEffect(() => {
        if(data && data !== mod)
            setMod(data);
    }, [data]);

	if (loading || !mod)
		return <Grid padding={8} background="$secondaryBackground2" smoothing={1} borderRadius={16} css={{
			border: 'transparent solid 1px',
			position: 'relative',
			background: 'linear-gradient($secondaryBackground2, $secondaryBackground2) padding-box, $gradientBackground2 border-box',
		}}>
			<Spinner/>
			<Grid spacing={2} vertical justifyContent="center">
				<Typography size={14} lineheight={1}>
					{t('app.mdpkm.common:states.loading')}
				</Typography>
				{id && platform &&
					<Typography size={12} color="$secondaryColor" weight={400} family="$secondary" lineheight={1}>
						{t('app.mdpkm.mod.platform', {
							id,
							name: t(`app.mdpkm.common:platforms.${platform.id}`)
						})}
					</Typography>
				}
			</Grid>
		</Grid>

    const iconSize = isCompact ? 32 : 44;
	return <ContextMenu.Root>
		<ContextMenu.Trigger asChild>
			<Grid padding={8} background="$secondaryBackground2" smoothing={1} borderRadius={16} css={{
				border: 'transparent solid 1px',
				position: 'relative',
				background: 'linear-gradient($secondaryBackground2, $secondaryBackground2) padding-box, $gradientBackground2 border-box',
			}}>
				<ImageWrapper src={mod.webIcon} size={iconSize} shadow smoothing={1} canPreview background="$secondaryBackground" borderRadius={8} css={{
					filter: mod.isExplict && 'blur(2px)',
					minWidth: iconSize
				}}/>
				<Grid margin={isCompact ? '4px 0 0 10px' : '4px 0 0 12px'} padding="2px 0" spacing={2} vertical>
					<Grid spacing={4}>
						<Tooltip.Root delayDuration={50}>
							<Tooltip.Trigger asChild>
								<Typography size={isCompact ? 14 : 16} onClick={openWebsite} noSelect lineheight={1} css={{
									cursor: 'pointer'
								}}>
									{mod.displayName}
								</Typography>
							</Tooltip.Trigger>
							<Tooltip.Portal>
								<Tooltip.Content>
									{t('mod.visit_site', {mod})}
									<Tooltip.Arrow/>
								</Tooltip.Content>
							</Tooltip.Portal>
						</Tooltip.Root>
						{mod.author && <Tooltip.Root delayDuration={50}>
							<Tooltip.Trigger asChild>
								<Typography size={isCompact ? 10 : 12} color="$secondaryColor" family="$secondary" onClick={openAuthor} noSelect lineheight={1} css={{
									cursor: 'pointer',
									'&:hover': { color: '$linkColor' }
								}}>
									{t('mod.author', {mod})}
								</Typography>
							</Tooltip.Trigger>
							<Tooltip.Portal>
								<Tooltip.Content>
									{t('mod.visit_site', {mod})}
									<Tooltip.Arrow/>
								</Tooltip.Content>
							</Tooltip.Portal>
						</Tooltip.Root>}
						{featured &&
							<Typography size={14} color="#cbc365" noSelect lineheight={1}>
								{t('mod.featured')}
							</Typography>
						}
						{recommended &&
							<Typography size={14} color="$secondaryColor" noSelect lineheight={1}>
								{t('mod.recommended')}
							</Typography>
						}
						{mod.isExplict &&
							<Typography size={14} color="#e18e8e" noSelect lineheight={1}>
								{t('mod.explict')}
							</Typography>
						}
					</Grid>
					{!isCompact && <Typography size={12} color="$secondaryColor" weight={400} noSelect lineheight={1}>
						{t(`mod.side.${mod.getSide()}`)}
					</Typography>}
					{showSummary && <Typography size={isCompact ? 12 : 14} color="$secondaryColor" weight={400} family="$secondary" noSelect textalign="left" whitespace="pre-wrap">
						{mod.summary}
					</Typography>}
				</Grid>
				<Grid spacing={8} css={{
					right: 8,
					position: 'absolute'
				}}>
					{typeof mod.downloads === 'number' &&
						<Typography size={isCompact ? 11 : 12} color="$secondaryColor" margin="0 8px 0 0" spacing={6} noSelect>
							<IconBiDownload/>
							{t('mod.downloads', {mod})}
						</Typography>
					}
					<Button size={isCompact ? 'smaller' : 'small'} theme="accent" onClick={installMod} disabled={mod.getSide() === ProjectSide.Unknown || installing || installed}>
						{installing ?
							<BasicSpinner size={16}/> : <IconBiDownload/>
						}
						{installed ? t('common.label.installed') : mod.getSide() === ProjectSide.Unknown ? t('app.mdpkm.common:states.unavailable') :
							installing ? t('common.label.installing') : t('common.action.install')
						}
					</Button>
				</Grid>
			</Grid>
		</ContextMenu.Trigger>
		<ContextMenu.Content>
			<ContextMenu.MenuLabel>
				{mod.displayName} {t('mod.author', {mod})} ({t(`voxura:platform.${mod.source.id}`)})
			</ContextMenu.MenuLabel>
			{instance && <ContextMenu.MenuItem onClick={installMod} disabled={installing || installed}>
				{installing ? <BasicSpinner size={16}/> : <IconBiDownload/>}
				{t('common.action.install')}
			</ContextMenu.MenuItem>}
			<ContextMenu.MenuItem onClick={openWebsite}>
				<IconBiBoxArrowUpRight/>
				{t('common.action.view_website')}
			</ContextMenu.MenuItem>
			<ContextMenu.MenuSeparator/>
			<ContextMenu.MenuItem onClick={() => writeText(mod.id)}>
				<IconBiClipboardPlus/>
				{t('common.action.copy_id')}
			</ContextMenu.MenuItem>
		</ContextMenu.Content>
	</ContextMenu.Root>;
}