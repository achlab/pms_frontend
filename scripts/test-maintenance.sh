#!/bin/bash

# Maintenance Simplified Workflow Test Runner
# Run all maintenance-related tests

echo "🧪 Running Maintenance Simplified Workflow Tests..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Run component tests
echo -e "${YELLOW}📦 Running Component Tests...${NC}"
npm test -- __tests__/components/maintenance/approve-reject-modal.test.tsx --verbose
COMPONENT_EXIT=$?

echo ""
echo -e "${YELLOW}📦 Running Card Component Tests...${NC}"
npm test -- __tests__/components/maintenance/maintenance-request-card.test.tsx --verbose
CARD_EXIT=$?

# Run service tests
echo ""
echo -e "${YELLOW}🔧 Running Service Tests...${NC}"
npm test -- __tests__/lib/services/maintenance.service.test.ts --verbose
SERVICE_EXIT=$?

# Run integration tests
echo ""
echo -e "${YELLOW}🔗 Running Integration Tests...${NC}"
npm test -- __tests__/integration/maintenance-workflow.test.tsx --verbose
INTEGRATION_EXIT=$?

# Summary
echo ""
echo "================================"
echo "📊 Test Summary"
echo "================================"

if [ $COMPONENT_EXIT -eq 0 ]; then
  echo -e "${GREEN}✅ Component Tests: PASSED${NC}"
else
  echo -e "${RED}❌ Component Tests: FAILED${NC}"
fi

if [ $CARD_EXIT -eq 0 ]; then
  echo -e "${GREEN}✅ Card Component Tests: PASSED${NC}"
else
  echo -e "${RED}❌ Card Component Tests: FAILED${NC}"
fi

if [ $SERVICE_EXIT -eq 0 ]; then
  echo -e "${GREEN}✅ Service Tests: PASSED${NC}"
else
  echo -e "${RED}❌ Service Tests: FAILED${NC}"
fi

if [ $INTEGRATION_EXIT -eq 0 ]; then
  echo -e "${GREEN}✅ Integration Tests: PASSED${NC}"
else
  echo -e "${RED}❌ Integration Tests: FAILED${NC}"
fi

echo "================================"

# Exit with error if any test failed
if [ $COMPONENT_EXIT -ne 0 ] || [ $CARD_EXIT -ne 0 ] || [ $SERVICE_EXIT -ne 0 ] || [ $INTEGRATION_EXIT -ne 0 ]; then
  echo -e "${RED}❌ Some tests failed${NC}"
  exit 1
else
  echo -e "${GREEN}✅ All tests passed!${NC}"
  exit 0
fi

