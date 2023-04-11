import styled from "styled-components";
import {
  Spacer,
  StyledCard,
  WidgetHeader,
  IWidgetSettingProps,
} from "@hadmean/chromista";
import { WidgetRoot } from "frontend/views/Dashboard/styles";
import { ReactNode, forwardRef } from "react";
import { ISharedWidgetConfig } from "shared/types/dashboard/base";
import { IWidgetConfig } from "shared/types/dashboard";
import { useWidgetNavigationLink } from "../../useWidgetNavigationLink";
import { PORTAL_WIDGET_SIZES } from "../../portal";

const StyledBox = styled.div`
  padding: 24px;
`;

interface IProps {
  config: ISharedWidgetConfig;
  setting?: IWidgetSettingProps;
  children: ReactNode;
  type: IWidgetConfig["_type"];
}

export const WidgetFrame = forwardRef<HTMLDivElement, IProps>(
  ({ children, setting, config, type }, ref) => {
    const navigationLink = useWidgetNavigationLink(
      config.entity,
      config.queryId
    );

    const defaultWidgetSizes = PORTAL_WIDGET_SIZES[type];

    const height = config.height || defaultWidgetSizes.height;

    const styleHeight = height ? `${height}px` : undefined;

    return (
      <WidgetRoot
        ref={ref}
        size={config.size || defaultWidgetSizes.size}
        hasSetting={!!setting}
      >
        <StyledCard>
          <StyledBox>
            <WidgetHeader
              setting={setting}
              title={config.title}
              link={navigationLink}
            />
            <Spacer />
            <div
              style={{
                height: styleHeight,
              }}
            >
              {children}
            </div>
          </StyledBox>
        </StyledCard>
      </WidgetRoot>
    );
  }
);