import { describe, expect, it } from 'vitest';
import { generateComplianceReport, type ComplianceReportInput } from './complianceReportGenerator';
import { getSecurityProfile } from './securityProfileCatalog';

describe('generateComplianceReport', () => {
  const baseInput: ComplianceReportInput = {
    pipelineName: 'Test Pipeline',
    nodes: [],
    edges: [],
    securityProfile: 'general',
    generatedAt: '2023-01-01T00:00:00.000Z', // Explicit to ensure deterministic hash
  };

  it('generates a report with all inputs and expected title prefix (Happy Path)', async () => {
    const input: ComplianceReportInput = {
      ...baseInput,
      evaluation: {
        complianceScore: 95,
        recommendation: 'Looks good',
        explanation: 'Passed all checks',
        weakPoints: ['None'],
        strongPoints: ['Fast', 'Secure'],
        promptHash: 'abc123hash',
      },
      nodes: [{ id: 'n1', label: 'Node 1' }],
      edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
    };

    const report = await generateComplianceReport(input);

    expect(report.title).toBe('EFVP - Test Pipeline');
    expect(report.status).toBe('pass');
    expect(report.complianceScore).toBe(95);
    expect(report.generatedAt).toBe('2023-01-01T00:00:00.000Z');
    expect(report.profileId).toBe('general');
    expect(report.sha256).toMatch(/^[a-f0-9]{64}$/);

    // Check markdown inclusion
    expect(report.markdown).toContain('# EFVP - Test Pipeline');
    expect(report.markdown).toContain('Prompt hash: abc123hash');
    expect(report.markdown).toContain('Weak points: None');
    expect(report.markdown).toContain('Strong points: Fast; Secure');
  });

  describe('Score Priority & Bounds', () => {
    it('uses complianceScore over coherenceScore', async () => {
      const report = await generateComplianceReport({
        ...baseInput,
        evaluation: { complianceScore: 80, coherenceScore: 90 },
      });
      expect(report.complianceScore).toBe(80);
    });

    it('falls back to coherenceScore if complianceScore is absent', async () => {
      const report = await generateComplianceReport({
        ...baseInput,
        evaluation: { coherenceScore: 85 },
      });
      expect(report.complianceScore).toBe(85);
    });

    it('falls back to 0 if both scores are absent', async () => {
      const report = await generateComplianceReport({
        ...baseInput,
        evaluation: {},
      });
      expect(report.complianceScore).toBe(0);
    });

    it('caps negative scores at 0', async () => {
      const report = await generateComplianceReport({
        ...baseInput,
        evaluation: { complianceScore: -10 },
      });
      expect(report.complianceScore).toBe(0);
    });

    it('caps scores > 100 at 100', async () => {
      const report = await generateComplianceReport({
        ...baseInput,
        evaluation: { complianceScore: 110 },
      });
      expect(report.complianceScore).toBe(100);
    });

    it('rounds decimal scores', async () => {
      const report = await generateComplianceReport({
        ...baseInput,
        evaluation: { complianceScore: 85.6 },
      });
      expect(report.complianceScore).toBe(86);
    });
  });

  describe('Status Logic Boundaries', () => {
    const promotionThreshold = getSecurityProfile('general').promotionThreshold; // 93

    it('assigns pass status when exactly at promotionThreshold', async () => {
      const report = await generateComplianceReport({
        ...baseInput,
        evaluation: { complianceScore: promotionThreshold },
      });
      expect(report.status).toBe('pass');
    });

    it('assigns review status when exactly at 70', async () => {
      const report = await generateComplianceReport({
        ...baseInput,
        evaluation: { complianceScore: 70 },
      });
      expect(report.status).toBe('review');
    });

    it('assigns fail status when exactly at 69', async () => {
      const report = await generateComplianceReport({
        ...baseInput,
        evaluation: { complianceScore: 69 },
      });
      expect(report.status).toBe('fail');
    });
  });

  describe('Markdown Formatting & Lists', () => {
    it('omits Prompt hash when not provided', async () => {
      const report = await generateComplianceReport({
        ...baseInput,
        evaluation: { promptHash: undefined },
      });
      expect(report.markdown).not.toContain('Prompt hash:');
    });

    it('formats undefined arrays as none', async () => {
      const report = await generateComplianceReport({
        ...baseInput,
        evaluation: { weakPoints: undefined },
      });
      expect(report.markdown).toContain('Weak points: none');
    });

    it('formats empty arrays as none', async () => {
      const report = await generateComplianceReport({
        ...baseInput,
        evaluation: { strongPoints: [] },
      });
      expect(report.markdown).toContain('Strong points: none');
    });
  });

  describe('Node Label Resolution', () => {
    it('uses node.label when available', async () => {
      const report = await generateComplianceReport({
        ...baseInput,
        nodes: [{ id: 'n1', label: 'Explicit Label', data: { label: 'Data Label' } }],
      });

      const report2 = await generateComplianceReport({
        ...baseInput,
        nodes: [{ id: 'n1', label: 'Different Label', data: { label: 'Data Label' } }],
      });

      expect(report.sha256).not.toEqual(report2.sha256);
    });

    it('falls back to node.data.label when node.label is absent', async () => {
      const reportA = await generateComplianceReport({
        ...baseInput,
        nodes: [{ id: 'n1', type: 'custom', label: undefined, data: { label: 'Target Label' } }],
      });

      const reportB = await generateComplianceReport({
        ...baseInput,
        nodes: [{ id: 'n1', type: 'custom', label: 'Target Label', data: { label: 'Ignored' } }],
      });

      expect(reportA.sha256).toEqual(reportB.sha256);
    });
  });

  describe('Default Fallbacks', () => {
    it('defaults pipelineName if absent', async () => {
      const report = await generateComplianceReport({
        nodes: [],
        edges: [],
        securityProfile: 'general',
      });
      expect(report.title).toBe('EFVP - Visual Algorithm Designer pipeline');
    });

    it('generates a new generatedAt date if absent', async () => {
      const report = await generateComplianceReport({
        nodes: [],
        edges: [],
        securityProfile: 'general',
      });
      expect(report.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });
});