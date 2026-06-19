import { PropsWithChildren, useState } from 'react';
import { Box, Button, Chip, Stack, Toolbar, Tooltip, Typography, paperClasses } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import { cssVarRgba } from 'lib/utils';
import { useSettingsPanelContext } from 'providers/SettingsPanelProvider';
import { useSettingsContext } from 'providers/SettingsProvider';
import { RESET } from 'reducers/SettingsReducer';
import { blue, green } from 'theme/palette/colors';
import IconifyIcon from 'components/base/IconifyIcon';
import SimpleBar from 'components/base/SimpleBar';
import PromoCard from 'components/common/PromoCard';
import FontFamilyTab from './FontFamilyPanel';
import promo from '/assets/images/illustrations/4.webp';

/* ─── Icon Library types ─────────────────────────────────────── */
type IconLibrary = 'fontawesome' | 'material' | 'bootstrap' | 'remix' | 'phosphor';

const ICON_LIBS: {
  id: IconLibrary;
  name: string;
  short: string;
  color: string;
  icon: string;
  count: string;
}[] = [
  { id: 'fontawesome', name: 'Font Awesome', short: 'FA', color: '#528dd3', icon: 'fa6-brands:font-awesome', count: '2,000+' },
  { id: 'material',    name: 'Material',     short: 'MI', color: '#4285f4', icon: 'logos:google-icon',       count: '1,400+' },
  { id: 'bootstrap',   name: 'Bootstrap',    short: 'BI', color: '#7952b3', icon: 'logos:bootstrap',         count: '1,800+' },
  { id: 'remix',       name: 'Remix Icons',  short: 'RI', color: '#0ea5e9', icon: 'simple-icons:remix',      count: '2,800+' },
  { id: 'phosphor',    name: 'Phosphor',     short: 'PH', color: '#8b5cf6', icon: 'ph:sparkle-duotone',      count: '9,000+' },
];

/* ─── Icon Library Panel ─────────────────────────────────────── */
function IconLibraryPanel() {
  const [selected, setSelected] = useState<IconLibrary>('fontawesome');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSelect = async (lib: IconLibrary) => {
    setSelected(lib);
    setSaving(true);
    setSaved(false);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';
      await fetch(`${apiBase}/api/site-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iconLibrary: lib }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      /* silent */
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Stack direction="column" spacing={0.75}>
        {ICON_LIBS.map((lib) => {
          const isActive = selected === lib.id;
          return (
            <Tooltip key={lib.id} title={`${lib.count} icons`} placement="left" arrow>
              <Button
                onClick={() => handleSelect(lib.id)}
                variant={isActive ? 'soft' : 'outlined'}
                size="small"
                sx={[
                  {
                    justifyContent: 'flex-start',
                    gap: 1.25,
                    px: 1.5,
                    py: 0.75,
                    borderRadius: '10px',
                    border: isActive ? `2px solid ${lib.color}` : '1.5px solid',
                    borderColor: isActive ? `${lib.color} !important` : 'divider',
                    background: isActive ? `${lib.color}14` : 'transparent',
                    color: isActive ? lib.color : 'text.secondary',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.8rem',
                    textTransform: 'none',
                    '&:hover': {
                      background: `${lib.color}10`,
                      borderColor: `${lib.color} !important`,
                      color: lib.color,
                    },
                    transition: 'all 0.18s ease',
                  },
                ]}
              >
                {/* Color dot */}
                <Box
                  sx={{
                    width: 28, height: 28, borderRadius: '7px',
                    background: isActive ? lib.color : 'background.elevation2',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'background 0.18s',
                  }}
                >
                  <IconifyIcon
                    icon={lib.icon}
                    sx={{ fontSize: 15, color: isActive ? '#fff' : lib.color }}
                  />
                </Box>

                <Box sx={{ flex: 1, textAlign: 'left', lineHeight: 1.2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: 'inherit', lineHeight: 1.3 }}>
                    {lib.name}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.68rem', color: 'text.disabled', lineHeight: 1 }}>
                    {lib.count} icons
                  </Typography>
                </Box>

                {isActive && (
                  <Chip
                    label={saving ? '…' : saved ? '✓' : 'Active'}
                    size="small"
                    sx={{
                      height: 18, fontSize: '0.65rem', fontWeight: 700,
                      background: lib.color, color: '#fff', borderRadius: '6px',
                      '& .MuiChip-label': { px: 0.75 },
                    }}
                  />
                )}
              </Button>
            </Tooltip>
          );
        })}
      </Stack>
      <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: 'text.disabled', fontSize: '0.7rem' }}>
        Changes apply to the storefront instantly on save.
      </Typography>
    </Box>
  );
}

const SettingsPanel = () => {
  const { configDispatch } = useSettingsContext();
  const {
    settingsPanelConfig: { openSettingPanel },
    setSettingsPanelConfig,
  } = useSettingsPanelContext();

  const handleReset = () => {
    configDispatch({
      type: RESET,
    });
  };

  return (
    <div>
      <Drawer
        open={openSettingPanel}
        anchor="right"
        onClose={() => {
          setSettingsPanelConfig({ openSettingPanel: false });
        }}
        sx={({ zIndex }) => ({
          zIndex: zIndex.tooltip + 1,
          [`& .${paperClasses.root}`]: {
            width: 313,
          },
        })}
      >
        <Toolbar
          sx={(theme) => ({
            background: `linear-gradient(90.42deg, ${blue[300]} 13.1%, ${green[400]} 143.31%)`,
            gap: 1,

            ...theme.applyStyles('dark', {
              background: `linear-gradient(90.42deg, ${blue[900]} 13.1%, ${green[600]} 143.31%)`,
            }),
          })}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              flex: 1,
            }}
          >
            Customize
          </Typography>
          <Button
            variant="soft"
            sx={({ vars }) => ({
              bgcolor: cssVarRgba(vars.palette.common.whiteChannel, 0.1),
              color: vars.palette.common.white,
            })}
            startIcon={<IconifyIcon icon="material-symbols:reset-settings-rounded" />}
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            variant="soft"
            sx={({ vars }) => ({
              bgcolor: cssVarRgba(vars.palette.common.whiteChannel, 0.1),
              color: vars.palette.common.white,
            })}
            shape="square"
            onClick={() => {
              setSettingsPanelConfig({
                openSettingPanel: false,
              });
            }}
          >
            <IconifyIcon icon="material-symbols:close-rounded" sx={{ fontSize: 20 }} />
          </Button>
        </Toolbar>
        <Box
          sx={{
            flex: 1,
            overflow: 'hidden',
          }}
        >
          <SimpleBar
            sx={{
              height: 1,
              '& .simplebar-mask': {
                zIndex: 'unset',
              },
            }}
            disableHorizontal
            autoHide={false}
          >
            <Stack direction="column" justifyContent="space-between" sx={{ height: 1 }}>
              <Box sx={{ p: 3 }}>
                <Stack
                  direction="column"
                  sx={{
                    gap: 5,
                  }}
                >
                  <Section title="Font Family">
                    <FontFamilyTab />
                  </Section>
                  <Section title="Icon Library">
                    <IconLibraryPanel />
                  </Section>
                </Stack>
              </Box>
              <Box sx={{ p: 3 }}>
                <PromoCard
                  showFeatures={false}
                  title="All Advanced Features"
                  subTitle="Available at"
                  img={promo}
                  imgStyles={{ maxWidth: 80 }}
                />
              </Box>
            </Stack>
          </SimpleBar>
        </Box>
      </Drawer>
    </div>
  );
};

export default SettingsPanel;

const Section = ({
  title,
  disable,
  children,
}: PropsWithChildren<{ title: string; disable?: boolean }>) => {
  return (
    <Box
      sx={[
        !!disable && {
          pointerEvents: 'none',
          '& .SettingsItem': {
            '&:after': {
              bgcolor: 'unset',
            },
          },
        },
      ]}
    >
      <Typography
        variant="subtitle1"
        sx={[
          {
            fontWeight: 700,
            mb: 2,
          },
          !!disable && { mb: 1, color: 'text.disabled' },
        ]}
      >
        {title}
      </Typography>
      {disable && (
        <Stack sx={{ alignItems: 'center', gap: 0.5, mb: 2, color: 'info.main' }}>
          <IconifyIcon icon="material-symbols:info-outline" sx={{ fontSize: 16 }} />
          <Typography variant="subtitle2">Not available in this layout.</Typography>
        </Stack>
      )}
      <Box sx={[!!disable && { opacity: 0.4 }]}>{children}</Box>
    </Box>
  );
};
