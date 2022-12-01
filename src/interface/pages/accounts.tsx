import { open } from '@tauri-apps/api/shell';
import { appWindow } from '@tauri-apps/api/window';
import { writeText } from '@tauri-apps/api/clipboard';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';

import Tag from '../components/Tag';
import Grid from '../../../voxeliface/components/Grid';
import Image from '../../../voxeliface/components/Image';
import Button from '../../../voxeliface/components/Button';
import Portal from '../../../voxeliface/components/Portal';
import Typography from '../../../voxeliface/components/Typography';
import TextHeader from '../../../voxeliface/components/Typography/Header';
import ImagePreview from '../components/ImagePreview';
import BasicSpinner from '../../../voxeliface/components/BasicSpinner';
import * as DropdownMenu from '../../../voxeliface/components/DropdownMenu';

import API from '../../common/api';
import { toast } from '../../util';
import type { Account } from '../../../voxura';
import voxura, { AvatarType, useAccounts, useCurrentAccount } from '../../voxura';
export default function Accounts() {
    const { t } = useTranslation();
    const current = useCurrentAccount();
    const accounts = useAccounts();
    const addingAccount = false;
    const [error, setError] = useState<string | null>(null);
    const changeAccount = (account: Account) => voxura.auth.selectAccount(account);
    const deleteAccount = async(account: Account) => {
        await account.remove();
        toast(`Account removed`, `${account.name} has been removed.`);
    }
    const addNewAccount = async() => {
        try {
            toast('Check your browser', 'A new tab has opened in your default browser.');
            const accessCode = await API.Microsoft.getAccessCode(true);
            appWindow.setFocus();
            toast('Adding account', 'Make sure to close the browser tab!');

            const account = await voxura.auth.login(accessCode);
            toast('Account added', `${account.name} has been added.`);
        } catch(err: any) {
            console.error(err);
            if (err.includes('Network Error'))
                setError('NETWORK_ERR');
        }
    };
    return (
        <Grid height="-webkit-fill-available" padding=".75rem 1rem" direction="vertical" css={{
            overflow: 'auto'
        }}>
            <TextHeader>{t('app.mdpkm.accounts.header')}</TextHeader>
            <Grid spacing={8} padding="0 1rem" direction="vertical">
                <Image src="img/banners/microsoft.svg" width={112} height={24} margin="0 0 8px"/>
                {!current && <Typography size=".8rem" color="$secondaryColor" whitespace="pre">
                    {t('app.mdpkm.accounts.select_account')}
                </Typography>}
                <Grid spacing={8} direction="vertical">
                    {accounts.map((account, key) =>
                        <UserAccount key={key} account={account} current={current} changeAccount={changeAccount} deleteAccount={deleteAccount}/>
                    )}
                </Grid>
                <Button theme="accent" onClick={addNewAccount} disabled={addingAccount}>
                    {addingAccount ? <BasicSpinner size={16}/> : <IconBiPlusLg/>}
                    {t('app.mdpkm.accounts.add')}
                </Button>
            </Grid>
            {error && <Portal>
                <Grid width="100vw" height="100vh" background="#00000099" alignItems="center" justifyContent="center">
                    <Grid width="45%" padding={12} direction="vertical" background="$secondaryBackground" borderRadius={8} css={{
                        border: '1px solid $secondaryBorder2',
                        position: 'relative'
                    }}>
                        <TextHeader>Account Error</TextHeader>
                        {error == 'NOT_OWNED' && <Typography>
                            You do not own Minecraft: Java Edition.<br/>
                            <Typography size=".9rem" color="$secondaryColor">
                                Xbox Game Pass is unsupported.
                            </Typography>
                        </Typography>}
                        {error == 'NETWORK_ERR' && <Typography>
                            A network error occured.<br/>
                            <Typography size=".9rem" color="$secondaryColor">
                                Check your internet connection, you might be offline.
                            </Typography>
                        </Typography>}
                        <Grid margin="2rem 0 0" spacing={8}>
                            <Button theme="secondary" onClick={() => setError(null)} >
                                <IconBiXLg/>
                                Close
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Portal>}
        </Grid>
    );
};

export type UserAccountProps = {
    account: Account,
    current?: Account,
    changeAccount: (account: Account) => void,
    deleteAccount: (account: Account) => void
};
function UserAccount({ account, current, changeAccount, deleteAccount }: UserAccountProps) {
    const { t } = useTranslation();
    const isCurrent = account === current;
    const avatarUrl = account.getAvatarUrl(AvatarType.Xbox);
    const [previewAvatar, setPreviewAvatar] = useState(false);
    const copyUUID = () => {
        if (!account.uuid)
            return toast(t('app.mdpkm.common:toast.common_error_1'), t('app.mdpkm.common:toast.account_uuid_missing.body'));
        writeText(account.uuid).then(() => toast(t('app.mdpkm.common:toast.copied'), t('app.mdpkm.common:toast.copied_account_uuid.body')));
    };
    return <Grid width="50%" border={`1px solid $secondaryBorder${isCurrent ? 2 : ''}`} padding={8} spacing={12} alignItems="center" background="$secondaryBackground2" borderRadius={16} css={{
        position: 'relative'
    }}>
        <Image src={avatarUrl} size={40} onClick={() => setPreviewAvatar(true)} borderRadius={24} css={{
            cursor: 'zoom-in'
        }}/>
        {previewAvatar && <ImagePreview src={avatarUrl} size={192} onClose={() => setPreviewAvatar(false)}/>}
        <Typography>
            {account.xboxName}
            <Typography size={12} color="$secondaryColor" family="$primaryFontSans" lineheight={1}>
                {account.name}
            </Typography>
        </Typography>
        <Grid spacing={8} alignItems="center" css={{
            right: 16,
            position: 'absolute'
        }}>
            {isCurrent ? <Tag>
                <Typography size=".7rem" color="$tagColor">
                    {t('interface:account.tag.active')}
                </Typography>
            </Tag> : <Button theme="accent" onClick={() => changeAccount(account)}>
                {t('interface:common.action.select')}
            </Button>}
            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                    <Button theme="secondary">
                        <IconBiThreeDots/>
                    </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content sideOffset={8}>
                    <DropdownMenu.Label>{t('app.mdpkm.accounts.account.actions.label')}</DropdownMenu.Label>
                    <DropdownMenu.Item onClick={() => open('https://minecraft.net/profile')}>
                        {t('app.mdpkm.accounts.account.actions.manage_profile')}
                        <IconBiBoxArrowUpRight/>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onClick={() => open(`https://namemc.com/profile/${account.uuid}`)}>
                        {t('app.mdpkm.accounts.account.actions.view_namemc')}
                        <IconBiBoxArrowUpRight/>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onClick={() => deleteAccount(account)}>
                        {t('app.mdpkm.accounts.account.actions.remove')}
                    </DropdownMenu.Item>
                    <DropdownMenu.Item onClick={copyUUID}>
                        {t('app.mdpkm.accounts.account.actions.copy_uuid')}
                    </DropdownMenu.Item>
                    <DropdownMenu.Arrow/>
                </DropdownMenu.Content>
            </DropdownMenu.Root>
        </Grid>
    </Grid>;
}