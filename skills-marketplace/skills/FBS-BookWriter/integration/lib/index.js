/**
 * FBS-BookWriter — integration 可复用库（检索策略 + 账本 + 编排）
 */

'use strict';

const { SearchPolicyFacade } = require('./SearchPolicyFacade');
const { WebSearchLedger } = require('./WebSearchLedger');
const SearchBundle = require('./SearchBundle');
const {
  runProfessionalChapterPipeline,
  DEFAULT_ROLE_STEP_TIMEOUT_MS,
} = require('./MultiAgentPipeline');
const {
  BookWorkflowOrchestrator,
  createDefaultBookWorkflowEngine,
} = require('./BookWorkflowOrchestrator');
const BookLevelConsistency = require('./BookLevelConsistency');
const WorkbuddyMemoryDigest = require('./WorkbuddyMemoryDigest');
const WorkbuddyEnvironmentSnapshot = require('./WorkbuddyEnvironmentSnapshot');
const PathRedaction = require('./PathRedaction');
const { HeartbeatService } = require('./HeartbeatService');

module.exports = {
  SearchPolicyFacade,
  WebSearchLedger,
  executeS0ParallelResearch: SearchBundle.executeS0ParallelResearch,
  executeChapterGate: SearchBundle.executeChapterGate,
  buildS0Queries: SearchBundle.buildS0Queries,
  buildChapterQueries: SearchBundle.buildChapterQueries,
  DEFAULT_SEARCH_TIMEOUT_MS: SearchBundle.DEFAULT_SEARCH_TIMEOUT_MS,
  runProfessionalChapterPipeline,
  DEFAULT_ROLE_STEP_TIMEOUT_MS,
  BookWorkflowOrchestrator,
  createDefaultBookWorkflowEngine,
  BookLevelConsistency,
  evaluateEmDashBookLevel: BookLevelConsistency.evaluateEmDashBookLevel,
  WorkbuddyMemoryDigest,
  buildWorkbuddyMemoryDigest: WorkbuddyMemoryDigest.buildDigest,
  writeWorkbuddyDigestToBook: WorkbuddyMemoryDigest.writeDigestToBook,
  WorkbuddyEnvironmentSnapshot,
  collectWorkbuddyEnvironmentProbes: WorkbuddyEnvironmentSnapshot.collectProbes,
  diffWorkbuddyEnvironment: WorkbuddyEnvironmentSnapshot.diffProbes,
  writeWorkbuddyEnvironmentSnapshot: WorkbuddyEnvironmentSnapshot.writeSnapshot,
  PathRedaction,
  HeartbeatService,
  redactStringContent: PathRedaction.redactStringContent,
  redactDeep: PathRedaction.redactDeep,
  redactJsonObject: PathRedaction.redactJsonObject,
};
