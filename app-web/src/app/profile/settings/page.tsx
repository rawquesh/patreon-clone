import { Box } from "@chakra-ui/react";
import SettingsPage from "@/page-components/profile/settings-page";
import React from "react";

const Settings: React.FC = () => {
  return (
    <Box className="animate-fade-in-up">
      <SettingsPage />
    </Box>
  );
};

export default Settings;
