import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, VStack, Heading, Text, Button, Icon, Center, HStack } from '@chakra-ui/react';
import { LuTriangle as LuAlertTriangle, LuRefreshCw } from 'react-icons/lu';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Center h="full" w="full" p={8}>
          <VStack
            gap={6}
            maxW="400px"
            textAlign="center"
            p={8}
            bg="bg.surface"
            rounded="2xl"
            border="1px solid"
            borderColor="border.muted"
            shadow="2xl"
          >
            <Box
              p={4}
              bg="rgba(244, 63, 94, 0.1)"
              rounded="full"
              color="red.500"
            >
              <Icon fontSize="3xl">
                <LuAlertTriangle />
              </Icon>
            </Box>
            
            <VStack gap={2}>
              <Heading size="md" color="fg.default">Visualization Error</Heading>
              <Text fontSize="sm" color="fg.muted">
                Something went wrong while rendering this component. This usually happens due to unexpected data structures or network interruptions.
              </Text>
            </VStack>

            <Button
              onClick={this.handleRetry}
              variant="surface"
              colorPalette="teal"
              size="lg"
              w="full"
            >
              <HStack gap={2}>
                <LuRefreshCw />
                <Text>Reload System</Text>
              </HStack>
            </Button>
          </VStack>
        </Center>
      );
    }

    return this.props.children;
  }
}
