function calculateStreamDischarge(Qs, QstreamLeakage) {
    // Qs is the initial volumetric discharge of the stream (in m³/s)
    // QstreamLeakage is the stream leakage rate at time t (in m³/s)

    // Calculate stream discharge at time t
    const QsAtT = Qs - QstreamLeakage;

    return QsAtT;
}

module.exports = { calculateStreamDischarge };