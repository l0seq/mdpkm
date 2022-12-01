import React from 'react';
import { useTranslation } from 'react-i18next';

import InstanceList from '../components/InstanceList';
import InstancePage from '../components/InstancePage';
import { Grid, Button } from '../../../voxeliface';

import { setPage } from '../../store/slices/interface';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
export default function Instances() {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const instance = useAppSelector(state => state.interface.currentInstance);
    const changePage = (page: string) => dispatch(setPage(page));
    return <React.Fragment>
        <Grid width="35%" height="100%" direction="vertical" background="$blackA2" justifyContent="space-between" css={{
            maxWidth: '35%',
            borderRight: '1px solid $secondaryBorder'
        }}>
            <InstanceList id={instance}/>
            <Grid width="100%" padding={16} background="$secondaryBackground" alignItems="center" justifyContent="space-between">
                <Button theme="accent" onClick={() => changePage('create')}>
                    <IconBiPlusLg/>
                    {t('app.mdpkm.common:actions.create_instance')}
                </Button>
                <Button theme="secondary" onClick={() => changePage('import')}>
                    <IconBiFolderPlus/>
                    {t('app.mdpkm.common:actions.import2')}
                </Button>
            </Grid>
        </Grid>
        <InstancePage id={instance}/>
    </React.Fragment>;
};