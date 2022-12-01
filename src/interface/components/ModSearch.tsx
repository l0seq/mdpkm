import { styled } from '@stitches/react';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';

import Mod from './Mod';
import { Grid, Image, Select, Button, TextInput, Typography, BasicSpinner } from '../../../voxeliface';

import Patcher from '../../plugins/patcher';
import { toast } from '../../util';
import voxura, { Instance } from '../../voxura';
export type ModSearchProps = {
    instance: Instance
};
export default Patcher.register(function ModSearch({ instance }: ModSearchProps) {
    const { t } = useTranslation();

    const { store } = instance;
    const { gameComponent } = store;

    const [api, setApi] = useState('modrinth');
    const [hits, setHits] = useState(0);
    const [page, setPage] = useState(1);
    const [mods, setMods] = useState<any[]>([]);
    const [query, setQuery] = useState('');
    const [pages, setPages] = useState<(string | number)[]>([]);
    const [category, setCategory] = useState('none');
    const [pageLimit, setPageLimit] = useState(20);
    const [searching, setSearching] = useState(false);
    const search = (api: string) => {
        if (searching)
            return toast('how did we get here?', 'Already searching.');

        setSearching(true);
        voxura.getPlatform(api).searchMods(query, {
            limit: pageLimit,
            offset: (page - 1) * pageLimit,
            loaders: [gameComponent.id],
            versions: [gameComponent.version, gameComponent.version.substring(0, Math.max(4, gameComponent.version.lastIndexOf('.')))],
            categories: category === 'none' ? undefined : [category]
        }).then(({ hits, limit, total_hits }) => {
            const pageAmount = Math.ceil(total_hits / limit);
            if(pageAmount > 4)
                if(page + 3 >= pageAmount)
                    setPages([
                        1,
                        '-',
                        pageAmount - 4,
                        pageAmount - 3,
                        pageAmount - 2,
                        pageAmount - 1,
                        pageAmount
                    ]);
                else if(page > 4)
                    setPages([
                        1,
                        '-',
                        page - 1,
                        page,
                        page + 1,
                        '-',
                        pageAmount
                    ]);
                else
                    setPages([1, 2, 3, 4, 5, '-', pageAmount]);
            else
                setPages(Array.from({ length: pageAmount }, (_, i) => i + 1));
            setMods(hits);
            setHits(total_hits);
            setSearching(false);
        }).catch(err => {
            setMods([]);
            setSearching(false);
            console.error(err);
            toast('Unexpected error', err.message ?? 'Unknown Reason.');
        });
    };
    useEffect(() => {
        search(api);
    }, [api, page, category, instance.id]);
    return (
        <Grid width="100%" height="100%" spacing={8} direction="vertical" css={{ overflow: 'hidden' }}>
            <Grid width="100%" spacing={8} justifyContent="space-between">
                <Grid width="100%" spacing={4} direction="vertical">
                    <Typography size=".9rem" color="$secondaryColor">
                        {t('app.mdpkm.common:labels.search_query')}
                    </Typography>
                    <TextInput width="100%" value={query} onChange={setQuery}>
                        <Button theme="secondary" onClick={() => search(api)} disabled={searching}>
                            {searching ? <BasicSpinner size={16}/> : <IconBiSearch/>}
                            {t('app.mdpkm.common:actions.search')}
                        </Button>
                    </TextInput>
                </Grid>
                <Grid spacing={8}>
                    <Grid spacing={4} direction="vertical">
                        <Typography size=".9rem" color="$secondaryColor">
                            {t('app.mdpkm.common:labels.category')}
                        </Typography>
                        <Select.Root value={category} onChange={setCategory} disabled={searching}>
                            <Select.Group name="Categories">
                                <Select.Item value="none">
                                    {t('app.mdpkm.mod_search.categories.none')}
                                </Select.Item>
                                {/*API.get(api)?.categories.filter(c => c.project_type === 'mod').map(({ name, icon }, index) =>
                                    <Select.Item key={index} value={name}>
                                        <div style={{
                                            width: '16px',
                                            color: 'var(--colors-primaryColor)',
                                            height: '16px'
                                        }} dangerouslySetInnerHTML={{ __html: icon }}/>
                                        {t(`app.mdpkm.mod_search.categories.${api}.${name}`)}
                                    </Select.Item>
                                )*/}
                            </Select.Group>
                        </Select.Root>
                    </Grid>
                    <Grid spacing={4} direction="vertical">
                        <Typography size=".9rem" color="$secondaryColor">
                            {t('app.mdpkm.common:labels.platform')}
                        </Typography>
                        <Select.Root value={api} onChange={setApi} disabled={searching}>
                            <Select.Group name="Mod Platforms">
                                {Object.values(voxura.platforms).map((platform, key) =>
                                    <Select.Item key={key} value={platform.id}>
                                        <Image src={platform.webIcon} size={16} borderRadius={4}/>
                                        {platform.displayName}
                                    </Select.Item>
                                )}
                            </Select.Group>
                        </Select.Root>
                    </Grid>
                </Grid>
            </Grid>
            <Grid height="100%" spacing={8} direction="vertical" borderRadius={16} css={{ overflow: 'hidden auto' }}>
                {mods.map((mod, index) => <Mod key={index} data={mod} instanceId={instance.id}/>)}
                {mods.length === 0 && <Grid direction="vertical">
                    <Typography size="1.2rem" family="$primaryFontSans">
                        {t('app.mdpkm.common:headers.empty_list')}
                    </Typography>
                    <Typography size=".9rem" color="$secondaryColor" weight={400} lineheight={1}>
                        {t('app.mdpkm.common:headers.search_retry')}
                    </Typography>
                </Grid>}
            </Grid>
            <Grid width="100%" padding="0 8px" justifyContent="space-between">
                <Pagination page={page} pages={pages} setPage={setPage}/>
                <Typography size=".8rem" color="$secondaryColor" weight={400}>
                    {t('app.mdpkm.mod_search.results', { val: hits })}
                </Typography>
            </Grid>
        </Grid>
    );
});

const StyledPage = styled('button', {
    width: 32,
    color: '$primaryColor',
    margin: 0,
    height: 24,
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    fontSize: 12,
    alignItems: 'center',
    fontFamily: 'Nunito',
    background: '$secondaryBackground2',
    borderRadius: 24,
    justifyContent: 'center',

    '&:hover': {
        background: '$primaryBackground'
    }
});

export type PaginationProps = {
    page: number,
    pages: (string | number)[],
    setPage: (page: number) => void
};
function Pagination({ page, pages, setPage }: PaginationProps) {
    return <Grid spacing={4} alignItems="center">
        <StyledPage onClick={() => setPage(Math.max(page - 1, 1))}>
            <IconBiChevronLeft style={{fontSize: 10}}/>
        </StyledPage>
        {pages.map(page2 =>
            typeof page2 === 'string' ?
                <Grid width={24} height={2} background="$tagBorder"/>
            : <StyledPage css={{
                color: page === page2 ? '$buttonColor' : undefined,
                background: page === page2 ? '$buttonBackground' : undefined,
                pointerEvents: page === page2 ? 'none' : undefined
            }} onClick={() => setPage(page2)}>
                {page2}
            </StyledPage>
        )}
        <StyledPage onClick={() => setPage(Math.min(page + 1, pages[pages.length - 1] as number))}>
            <IconBiChevronRight style={{fontSize: 10}}/>
        </StyledPage>
    </Grid>;
};